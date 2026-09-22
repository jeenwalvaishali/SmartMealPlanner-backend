async function askAI(prompt, options = {}) {

    const response = await fetch(
        "http://localhost:11434/api/generate",
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                model: "llama3.2",
                prompt: prompt,
                stream: false,
                keep_alive: "10m",
                options
            })
        }
    );

    if (!response.ok) {
        throw new Error(`Ollama request failed with status ${response.status}`);
    }

    const data = await response.json();

    if (!data.response) {
        throw new Error('Ollama returned an empty response');
    }

    return data.response;
}

module.exports = { askAI };