let startIndex = 1;

function search() {
    const searchInput = document.getElementById("searchInput").value;
    const searchResults = document.getElementById("searchResults");
    const seeMoreButton = document.getElementById("seeMoreButton");
    const betterSearchButton = document.getElementById("betterSearchButton");

    startIndex = 1; // Reset start index for new search
    searchResults.innerHTML = ''; // Clear previous results
    if (seeMoreButton) {
        seeMoreButton.style.display = 'none'; // Hide "See More" button
    }
    if (betterSearchButton) {
        betterSearchButton.style.display = 'none'; // Hide "Better Search" button
    }

    fetchResults(searchInput, startIndex);
}

function seeMore() {
    const searchInput = document.getElementById("searchInput").value;
    startIndex += 10; // Increment start index for next set of results
    fetchResults(searchInput, startIndex);
}

function fetchResults(query, start) {
    const searchResults = document.getElementById("searchResults");
    const seeMoreButton = document.getElementById("seeMoreButton");
    const betterSearchButton = document.getElementById("betterSearchButton");
    const apiKey = 'AIzaSyAlW0OytXlq2V9apXRgyk7kZB9X81AJALk'; // Your API key
    const cx = 'f5f2e3b5f5bdd40e0'; // Your Custom Search Engine ID
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${query}&num=10&start=${start}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            console.log(data); // Log the entire response
            if (data.items) {
                data.items.forEach(item => {
                    const result = document.createElement('div');
                    result.innerHTML = `
                        <h3><a href="${item.link}">${item.title}</a></h3>
                        <p>${item.snippet}</p>
                        ${item.pagemap && item.pagemap.cse_image ? `<img src="${item.pagemap.cse_image[0].src}" alt="Image" class="responsive-img">` : ''}
                    `;
                    searchResults.appendChild(result);
                });
                if (data.queries.nextPage) {
                    if (seeMoreButton) {
                        seeMoreButton.style.display = 'block'; // Show "See More" button if more results are available
                        searchResults.appendChild(seeMoreButton); // Move "See More" button to the bottom
                    }
                    if (betterSearchButton) {
                        betterSearchButton.style.display = 'none'; // Hide "Better Search" button
                    }
                } else {
                    if (seeMoreButton) {
                        seeMoreButton.style.display = 'none'; // Hide "See More" button if no more results
                    }
                    if (betterSearchButton) {
                        betterSearchButton.style.display = 'block'; // Show "Better Search" button if no more results
                        searchResults.appendChild(betterSearchButton); // Move "Better Search" button to the bottom
                    }
                }
            } else {
                searchResults.innerHTML = 'No results found.';
                if (seeMoreButton) {
                    seeMoreButton.style.display = 'none'; // Hide "See More" button if no results
                }
                if (betterSearchButton) {
                    betterSearchButton.style.display = 'block'; // Show "Better Search" button if no results
                    searchResults.appendChild(betterSearchButton); // Move "Better Search" button to the bottom
                }
            }
        })
        .catch(error => {
            console.error('Error fetching search results:', error);
        });
}

function betterSearch() {
    const searchInput = document.getElementById("searchInput").value;
    const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchInput)}`;
    window.open(googleSearchUrl, '_blank');
}
