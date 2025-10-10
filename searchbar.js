const url = "testing1.json";

document.addEventListener('keyup',DisplayHawker);

document.addEventListener('submit',function(event){
    //stop the form reload
    event.preventDefault();
    displayStallinfo();
    //call this function 
})


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
       
        for(var i=0;i< hawkerlist.length;i++){
           var name = hawkerlist[i].name;
           if(name.toLowerCase().indexOf(lowercaseinput) !== -1){
                var li = document.createElement('li');
                li.textContent = name;
                li.style.cursor = "pointer";
                li.style.padding = "5px";
                li.style.border = "1px solid #ccc";
                li.style.borderRadius = "5px";

                //user click on the one of hawker name suggestion
                //will fill the input box with it
                //clear the suggestion list(as it already selected)
                li.addEventListener('click',function(e){
                    document.getElementById('hawkername').value = e.target.textContent;
                    clearSuggest(suggest)

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
    var selecthawker = document.getElementById('hawkername').value;
    //check that the input box is correct
    if(selecthawker === ''){
        alert("Please type a hawker centre name");
        return;
    }
    //click to the stallinfo.html
    document.getElementById('displaystallinfo').click();
}