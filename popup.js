function cleanURL(url) {
    try {
        // Remove Scroll-to-text fragement
        const index = url.indexOf("#:~:text");
        
        if (index !== -1) {
            url = url.substring(0, index);
        }

        // Remove query string
        url = url.split('?')[0];
        
        return url;
    } catch (e) {
        return url;
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const openRequest = indexedDB.open('saveTextDb_text-saver', 1);

    openRequest.onsuccess = function (event) {
        const db = event.target.result;

        // Transaction to read data
        const transaction = db.transaction('selectedTexts', 'readonly');
        const objectStore = transaction.objectStore('selectedTexts');

        // Get all records from the object store
        const request = objectStore.getAll();

        request.onsuccess = function () {
            const savedTexts = request.result;
            const savedTextElement = document.getElementById("savedText");

            if (savedTexts.length > 0) {
                savedTexts.forEach(function (data, index) {
                    // Create a div for each set of data
                    const dataDiv = document.createElement("div");
                    dataDiv.classList.add("saved-text");

                    // Scroll-to-text-fragement only supports Chrom >= v80
                    let dataText = data.selectedText.split(" ");
                    if (dataText.length > 10) {
                        dataText = encodeURIComponent(dataText.slice(0, 10).join(" ")) + 
                                    " ," + 
                                    encodeURIComponent(dataText.slice(-10).join(" "));
                    } else {
                        dataText = encodeURIComponent(dataText.join(" "));
                    }

                    dataDiv.innerHTML = `<p><a href="${cleanURL(data.url)}#:~:text=${dataText}" target="_blank">${data.title}</a></p>`;
                    dataDiv.innerHTML += `<p>${data.selectedText}</p>`;
            
                    // Append the div to the savedTextElement
                    savedTextElement.appendChild(dataDiv);
                });
            } else {
                savedTextElement.textContent = "No saved texts found.";
            }
        };

        request.onerror = function (event) {
            console.error('Error retrieving data from IndexedDB:', event.target.error);
        };
    };

    openRequest.onerror = function (event) {
        console.error('Error opening IndexedDB:', event.target.error);
    };
});
