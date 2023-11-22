export async function onRequestPost(context, env) {
  try {
    const input = await context.request.formData();

    // Convert FormData to JSON
    const output = {};
    for (const [key, value] of input) {
      const tmp = output[key];
      if (tmp === undefined) {
        output[key] = value;
      } else {
        output[key] = [].concat(tmp, value);
      }
    }

    // Construct the email content
    const emailContent = `
        <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 0;
                }
        
                .container {
                    max-width: 600px;
                    margin: 20px auto;
                    background-color: #ffffff;
                    padding: 20px;
                    border-radius: 5px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                }
        
                h1 {
                    color: #333333;
                    font-size: 24px;
                    margin-top: 0;
                }
        
                p {
                    color: #666666;
                    line-height: 1.5;
                    margin-bottom: 10px;
                }
        
                .label {
                    font-weight: bold;
                    color: #444444;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Website Inquiry</h1>
                <p><span class="label">Name:</span> ${output.name}</p>
                <p><span class="label">Email:</span> ${output.email}</p>
                <p><span class="label">Message:</span> ${output.message}</p>
            </div>
        </body>
        </html>
        `;

    // Send the email using Mailgun API
    const emailResponse = await fetch(
      context.env.MAILGUN_API_URL + context.env.MAILGUN_DOMAIN + '/messages',
      {
        method: 'POST',
        headers: {
          Authorization: 'Basic ' + btoa('api:' + context.env.MAILGUN_API_KEY),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          from: context.env.FROM_EMAIL,
          to: context.env.TO_EMAIL,
          'h:Reply-To': output.email,
          subject: `Website Inquiry from ${output.name}`,
          html: emailContent
        })
      }
    );

    if (!emailResponse.ok) {
      throw new Error(
        'Failed to send email via Mailgun. Please try again. If the issue persists, please contact us directly at ' +
        context.env.TO_EMAIL +
        '.'
      );
    }

    return new Response(
      'Email sent successfully! You can close this window or click back to resume browsing the website.',
      {
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        }
      }
    );
  } catch (err) {
    return new Response('Error: ' + err.message, { status: 400 });
  }
}
