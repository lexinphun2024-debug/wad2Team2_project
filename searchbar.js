const url = "testing1.json";

document.addEventListener('keyup',DisplayHawker);

//clear the old suggestion before fetching new result
//run every time user types in input
function clearSuggest(elesuggest){
    while(elesuggest.firstChild){
        elesuggest.removeChild(elesuggest.firstChild);
    }
}


function DisplayHawker(){
    var input = document.getElementById('hawkername').value;
    var lowercaseinput = input.toLowerCase();
    var suggest = document.getElementById('suggesthawkername');

    //always clear the suggestion first
    clearSuggest(suggest);
    
    //when userinput, will appear nothing
    if(lowercaseinput === "") {
        return;
    }
        
    axios.get(url)
    .then(response =>{

        const hawkerlist = response.data;
        console.log(hawkerlist);
        for(var i=0;i< hawkerlist.length;i++){
           var hkname = hawkerlist[i].hawker;
           if(hkname.toLowerCase().indexOf(lowercaseinput) !== -1){
                var li = document.createElement('li');
                li.textContent = hkname;
                li.style.cursor = "pointer";
                li.style.padding = "5px";
                li.style.border = "1px solid #ccc";
                li.style.borderRadius = "5px";

                //user click on the one of hawker name suggestion
                //will fill the input box with it
                //clear the suggestion list(as it already selected)
                li.addEventListener('click',function(e){
                    document.getElementById('hawkername').value = e.target.textContent;
                    clearSuggest(suggest);

                });

                suggest.appendChild(li);
                //add the hawker centre in <li> to <ul>

           }
        }
    }
    
    )
    .catch(error =>
        console.log(error)
    );

    
}

function displayStallinfo(){
    var selecthawker = document.getElementById('hawkername').value.trim();
    //remove any extra spaces at begin or end of
    console.log(selecthawker);

    //check that the input box is correct
    if(selecthawker === ''){
        alert("Please type a hawker centre name");
        return;
    }
    // Redirect to stallinfo.html with the hawker name as a query parameter
    window.location.href = `stallinfo.html?hawker=${encodeURIComponent(selecthawker)}`;
    
}