
        // Fetch selected hawker name from URL
        function getHawkerFromURL() {
            const params = new URLSearchParams(window.location.search);
            return params.get('hawker'); // returns null if not found
        }

        const hawkerName = getHawkerFromURL();
        console.log(hawkerName);

        if(!hawkerName){ //null
            alert("No hawker centre selected. Returning to homepage.");
            window.location.href = "homepage.html";
        }

        document.getElementById('hawkerTitle').textContent = hawkerName;

        // Fetch stalls and Menu info 
        axios.get('testing1.json')
            .then(response => {
                const data = response.data;
                const hawker = data.find(h => h.hawker === hawkerName); 
                //find the data that match

                if(!hawker || !hawker.stalls.length){ //cannot find the hawker name or hawker centre no input stall
                    document.getElementById('stallsContainer').innerHTML = "<p class='text-center'>No stalls found for this hawker centre.</p>";
                    return;
                }

                const container = document.getElementById('stallsContainer');
                container.innerHTML = ''; // clear container


                const row = document.createElement('div');
                row.className = "row g-4";

                hawker.stalls.forEach(stall => {
                    //Column
                    const col = document.createElement('div');
                    col.className = "col-md-6 col-lg-4";

                    // Create card
                    const card = document.createElement('div');
                    card.className = "card shadow-sm border-0 rounded-4 h-100";

                    const cardBody = document.createElement('div');
                    cardBody.className = "card-body";

                    // Stall name(header)
                    const stallName = document.createElement('h5');
                    stallName.className = "card-title fw-semibold mb-2";
                    stallName.textContent = stall.name;

                    //queue and rating same row
                    const infopart = document.createElement('div');
                    infopart.className = "d-flex justify-content-between align-items-center mb-2";

                    //create badge for queue
                    const queue = document.createElement('span');
                    let queueclassname = '';

                    if(stall.queueLength < 10){
                        queueclassname = "bg-success bg-opacity-56";
                    }else if(stall.queueLength < 20){
                        queueclassname = "bg-warning";
                    }else{
                        queueclassname = "bg-danger bg-opacity-75";
                    }

                    queue.className = `badge ${queueclassname} text-dark`;
                    queue.textContent = `Queue: ${stall.queueLength} mins`;

                    const rating = document.createElement('span');
                    rating.className = "text-muted";
                    rating.innerHTML = `⭐ ${stall.rating}`;

                    infopart.appendChild(queue);
                    infopart.appendChild(rating);

                    //Show Menu Button
                    const toggleBtn = document.createElement('button');
                    toggleBtn.className = "btn btn-outline-primary w-100 mt-2";
                    toggleBtn.textContent = "Show Menu ▼";

                    // Hidden the menu list
                    const menuList = document.createElement('ul');
                    menuList.className = "list-group list-group-flush collapse";


                    stall.menu.forEach(item => {
                        const li = document.createElement('li');
                        li.className = "list-group-item";
                        li.textContent = `${item.item} - $${item.price}`;
                        menuList.appendChild(li);
                    });

                    //show the menu list when the user click on the 'show menu' button
                    toggleBtn.addEventListener('click', () =>{
                        const shown = menuList.classList.contains('show');
                        menuList.classList.toggle('show');
                        if(shown){
                            toggleBtn.textContent = "Show Menu ▼";
                        }else{
                             toggleBtn.textContent = "Hide Menu ▲";
                        }
                    })

                    cardBody.appendChild(stallName);
                    cardBody.appendChild(infopart);
                    cardBody.appendChild(toggleBtn);
                    card.appendChild(cardBody);
                    card.appendChild(menuList);
                    col.appendChild(card);
                    row.appendChild(col);
                    
                });
                container.appendChild(row);
            })
            .catch(error => console.error(error));