if (!sdKey) {
      return NextResponse.json({
        success: true, refinedPrompt, imageUrl: null, mockupStyle,
        hasImage: false, error: "SD key missing from environment"
      });
    }

    const sdRes = await fetch("https://stablediffusionapi.com/api/v3/text2img", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key: sdKey,
        prompt: refinedPrompt + ", professional product photography, flat lay, studio lighting, high resolution",
        negative_prompt: "human, person, face, hands, low quality, blurry, watermark, deformed",
        width: "512", height: "512", samples: "1",
        num_inference_steps: "30", guidance_scale: 7.5,
        safety_checker: "no", enhance_prompt: "yes",
      }),
    });
    const sdData = await sdRes.json();
    if (sdData.status === "success" && sdData.output?.[0]) {
      imageUrl = sdData.output[0];
    }
