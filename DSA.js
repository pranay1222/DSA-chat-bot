const questionInput = document.getElementById("questionInput");
const askButton = document.getElementById("askButton");
const loadingIndicator = document.getElementById("loadingIndicator");
const outputArea = document.getElementById("outputArea");

const GEMINI_API_KEY = "AIzaSyDDs-IHmmeW_ak7VAaalUO0hH6cvJL6ur4";
const MODEL_NAME = "gemini-2.5-flash";
const systemInstructionText = "You are a DSA Instructor. You will help me only with Data Structure and Algorithm questions. You have to answer the question in a concise manner. If user asks for code, you will provide the code in a single code block. If user asks any question not related to Data Structure and Algorithm, reply rudely. Example: If user asks, How are you? You will reply: You dumb, ask me sensible question.";

const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`;

askButton.addEventListener('click', async () => {
    let question = questionInput.value.trim();

    if (!question) {
        outputArea.innerHTML = '<div class="error-message"><i class="fas fa-exclamation-circle"></i> Please enter a coding question first!</div>';
        return;
    }

    outputArea.innerHTML = "";
    loadingIndicator.style.display = 'block';
    askButton.disabled = true;

    const reqBody = {
        contents: [
            {
                role: "user",
                parts: [{ text: question }]
            }
        ],
        systemInstruction: {
            parts: [{ text: systemInstructionText }]
        }
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(reqBody)
        });

        if (!response.ok) {
            const errorData = await response.json();
            let errorMsg = `API Error: ${response.status} - ${errorData.error.message || 'Unknown error'}`;

            if (errorData.error.message.toLowerCase().includes("api key")) {
                errorMsg += "<br><strong>Check your API key and permissions in Google Cloud Console.</strong>";
            }

            throw new Error(errorMsg);
        }

        const data = await response.json();

        if (data.candidates && data.candidates.length > 0 && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts.length > 0) {
            const answerText = data.candidates[0].content.parts[0].text;

            let formattedText = answerText.replace(/(```[\s\S]*?```)|(`[^`]+`)/g, (match) => {
                if (match.startsWith('```')) {
                    return `<pre><code>${match.replace(/```/g, '')}</code></pre>`;
                } else {
                    return `<code>${match.replace(/`/g, '')}</code>`;
                }
            });

            const paragraphs = formattedText.split("\n\n");
            let htmlOutput = '';

            for (const paragraph of paragraphs) {
                if (paragraph.trim() !== '') {
                    htmlOutput += `<p>${paragraph}</p>`;
                }
            }

            outputArea.innerHTML = htmlOutput;
        } else {
            outputArea.innerHTML = '<div class="error-message"><i class="fas fa-exclamation-triangle"></i> Unexpected response from AI.</div>';
        }
    } catch (error) {
        outputArea.innerHTML = `<div class="error-message"><i class="fas fa-exclamation-circle"></i> ${error.message}</div>`;
    } finally {
        loadingIndicator.style.display = 'none';
        askButton.disabled = false;
    }
});

// Enable ask on pressing Enter
questionInput.addEventListener("keypress", function (event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        askButton.click();
    }
});

// UI menu demo functionality
document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', function () {
        document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
        this.classList.add('active');
    });
});

// Sample example
setTimeout(() => {
    outputArea.innerHTML = `
        <p><strong>Welcome to Coding Instructor AI!</strong> I'm here to help you with DSA questions.</p>
        <p><strong>Question:</strong> What is a stack?</p>
        <p><strong>Answer:</strong> A stack is a linear data structure that follows the Last-In-First-Out (LIFO) principle.</p>
        <pre><code>let stack = [];
stack.push(10); // add
stack.pop();    // remove</code></pre>
    `;
}, 2000);
