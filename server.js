const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.static('public'));

// Helper functions
function extractPanoptoId(url) {
  const idRegex = /[?&]id=([a-f0-9-]+)/i;
  const match = url.match(idRegex);
  return match ? match[1] : null;
}

function extractPanoptoDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return null;
  }
}

function parseSRT(srtContent) {
  const captions = [];
  const lines = srtContent.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const timeMatch = line.match(/(\d{2}):(\d{2}):(\d{2}),(\d{3}) --> (\d{2}):(\d{2}):(\d{2}),(\d{3})/);
    
    if (timeMatch) {
      const [, sh, sm, ss, sms, eh, em, es, ems] = timeMatch.map(Number);
      const start = (sh * 3600 + sm * 60 + ss) * 1000 + sms;
      const end = (eh * 3600 + em * 60 + es) * 1000 + ems;
      
      let text = '';
      for (let j = i + 1; j < lines.length; j++) {
        const textLine = lines[j].trim();
        if (textLine === '') break;
        text += (text ? ' ' : '') + textLine;
      }
      
      if (text) {
        captions.push({ start, end, text });
      }
    }
  }
  
  return captions;
}

// API endpoint for proxy extraction
app.get('/get-captions', async (req, res) => {
  const panoptoUrl = req.query.url;

  if (!panoptoUrl) {
    return res.status(400).json({ error: 'Panopto URL is required.' });
  }

  try {
    console.log('🎯 Proxy extraction for:', panoptoUrl);

    // Extract delivery ID and domain
    const deliveryId = extractPanoptoId(panoptoUrl);
    const domain = extractPanoptoDomain(panoptoUrl);

    if (!deliveryId || !domain) {
      throw new Error('Could not extract delivery ID or domain from URL.');
    }

    console.log('📋 Extracted delivery ID:', deliveryId);
    console.log('🌐 Using domain:', domain);

    // Try DeliveryInfo endpoint first
    const deliveryInfoUrl = `https://${domain}/Panopto/Pages/Viewer/DeliveryInfo.aspx?deliveryId=${deliveryId}&responseType=json`;
    
    try {
      console.log('🔍 Fetching delivery info from:', deliveryInfoUrl);
      
      const deliveryInfoResponse = await axios.get(deliveryInfoUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Connection': 'keep-alive',
          'Referer': panoptoUrl
        },
        timeout: 10000
      });

      console.log('✅ Delivery info response status:', deliveryInfoResponse.status);
      const deliveryInfo = deliveryInfoResponse.data;
      
      if (deliveryInfo?.Delivery?.Streams) {
        const captionStream = deliveryInfo.Delivery.Streams.find(s => s.StreamType === 'Caption');
        
        if (captionStream?.StreamUrl) {
          console.log('✅ Found caption stream:', captionStream.StreamUrl);
          
          const captionResponse = await axios.get(captionStream.StreamUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
              'Accept': 'text/plain, */*',
              'Referer': panoptoUrl
            },
            timeout: 10000
          });

          console.log('✅ Caption response status:', captionResponse.status);
          const rawCaptions = captionResponse.data;
          const captions = parseSRT(rawCaptions);
          
          if (captions.length > 0) {
            console.log('✅ Successfully extracted', captions.length, 'captions via DeliveryInfo');
            const transcript = captions.map(c => c.text).join(' ');
            
            return res.json({
              success: true,
              transcript: transcript,
              captions: captions,
              metadata: {
                title: deliveryInfo.Delivery.Name || 'Panopto Video',
                description: deliveryInfo.Delivery.Description || '',
                duration: deliveryInfo.Delivery.Duration || 0,
                creator: deliveryInfo.Delivery.Creator || '',
                created: deliveryInfo.Delivery.CreatedDate || '',
                sessionId: deliveryId,
                source: panoptoUrl,
                extractionMethod: 'Proxy DeliveryInfo'
              }
            });
          }
        }
      }
    } catch (deliveryError) {
      console.log('❌ DeliveryInfo method failed:', deliveryError.message);
    }

    // Fallback to SRT endpoint
    console.log('🔄 Trying SRT endpoint...');
    const srtUrl = `https://${domain}/Panopto/Pages/Transcription/GenerateSRT.ashx?id=${deliveryId}`;
    
    try {
      const srtResponse = await axios.get(srtUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
          'Accept': 'text/plain, */*',
          'Referer': panoptoUrl
        },
        timeout: 10000
      });

      if (srtResponse.data && srtResponse.data.trim()) {
        console.log('✅ Found captions via SRT endpoint');
        const captions = parseSRT(srtResponse.data);
        
        if (captions.length > 0) {
          console.log('✅ Successfully extracted', captions.length, 'captions via SRT');
          const transcript = captions.map(c => c.text).join(' ');
          
          return res.json({
            success: true,
            transcript: transcript,
            captions: captions,
            metadata: {
              title: 'Panopto Video',
              sessionId: deliveryId,
              source: panoptoUrl,
              extractionMethod: 'Proxy SRT Endpoint'
            }
          });
        }
      }
    } catch (srtError) {
      console.log('❌ SRT endpoint failed:', srtError.message);
    }

    // If we get here, no captions were found
    console.log('❌ No captions found for this video');
    return res.status(404).json({
      success: false,
      error: 'No captions found for this video. The video may not have captions enabled or may require authentication.',
      requiresManual: true,
      guidance: 'This video may not have captions available or may require authentication. Please try the manual extraction method.',
      sessionId: deliveryId
    });

  } catch (error) {
    console.error('❌ Proxy extraction failed:', error);
    
    // Check if it's an authentication error
    if (error.response?.status === 401 || error.response?.status === 403) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. This video requires login to access captions.',
        authRequired: true,
        guidance: 'Please sign in to Panopto in your browser and try again, or use the manual extraction method.',
        sessionId: extractPanoptoId(panoptoUrl)
      });
    }
    
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to extract captions from this video',
      requiresManual: true,
      guidance: 'An unexpected error occurred during extraction. Please try the manual method.',
      sessionId: extractPanoptoId(panoptoUrl)
    });
  }
});

// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Panopto Caption Proxy Server is running on http://localhost:${PORT}`);
  console.log(`📝 Visit the URL above to use the caption extractor`);
});
