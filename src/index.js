'use strict'

import './style.css';
import jsonData from './data.json';
import profile1 from './profiles/chocolateyislove00119922.json'

console.log(profile1)

let recordedMonths;
let recordedData;
let selectCont;


window.onload = async () => {
    
//get the content divs and store them in an array
    let groupDiv = document.getElementById('group')
    let individualDiv = document.getElementById('individual')
    let formDiv = document.getElementById('form')

    let contentDivs = []
    contentDivs.push(groupDiv,individualDiv, formDiv)


//Navbar - get the navlinks and add eventlisteners for click
    let navLinks = document.getElementsByClassName('nav-link');

    for (let i = 0; i < navLinks.length; i++) {
        navLinks[i].addEventListener('click', ()=>{
            
            //remove the "active" class from links
            for (let i = 0; i < navLinks.length; i++) {
                navLinks[i].classList.remove('active')
            }

            //if this is clicked, it is the active link, so set the class "active"
            navLinks[i].classList.add('active')
            

            //show the right div - gets the slected tab ID and removes the 'tab' at the end
            let selectedContainerID = navLinks[i].id.slice(0,-3); 

            contentDivs.forEach(div =>{

                if(div.id == selectedContainerID){
                    div.removeAttribute('class', 'hidden')
                }else{
                    div.setAttribute('class', 'hidden')
                }
            })


        })
    }

//GET DATA FROM JSON
    //jsonData is imported in this file (see top) and named jsonData
    let response = await fetch('../src/data.json')
    let test = await response.json();

    console.log(test)
    
    recordedMonths = test.recordedMonths;
    recordedData = test.recordedData;

//GROUP DATA SECTION
    createGroupTable(recordedMonths, recordedData)


//INDIVIDUAL DATA SECTION
    //select box
    selectCont = document.getElementById('list');
    fillSelect(recordedData)

    //add event listener for change to the select
    selectCont.addEventListener('change', () =>{

        //filter the recorded data to only get the data of the selected student
        let selectedStudentProfile = selectCont.value;
        let selectedStudentName = selectCont.selectedOptions[0].innerHTML;
        let filteredRecordedData = recordedData.filter(
                record => record.student === selectedStudentName 
            )
        
        //check if user is in JSON file or not, based on value of studentprofile
        let cardContainer = document.getElementById('card-container')
        if(selectedStudentProfile === "Unknown profile"){ //this is for the data that is put in in the new data tab

            createCard(cardContainer, filteredRecordedData, "")

        }else{

            //get the correct profile json data and use it to set the data in the card together with the filteredrecorddata
            let profileData = 
            fetch(`../src/profiles/${selectedStudentProfile}`)
            .then(response => response.json())
            .then(profileData => {
                createCard(cardContainer, filteredRecordedData, profileData)
            })

            //draw the graph
            drawGraph(filteredRecordedData, recordedMonths)

        }

    })


//NEW DATA SECTION    
    //get submit button and add eventlistener for click
    let form = document.getElementById('newDataForm')
    form.addEventListener('submit' , () =>{
        submit(recordedData)
    })


}





//FUNCTIONS

function createGroupTable (recordedMonths, recordedData){
    //get the table and remove previous content
    let table = document.getElementById('table')
    table.innerHTML = ``;
    
    //create and append tbody
    let tableBody = document.createElement('tbody')
        table.appendChild(tableBody);


    //create header row of table and append to table
    let firstRow = document.createElement('tr')
    tableBody.appendChild(firstRow)

    let tableHeader = document.createElement('th') //the first th is always an empty one
        firstRow.appendChild(tableHeader);
    
    recordedMonths.forEach(month => {               //create and append th for each month
        let th = document.createElement('th')
            th.textContent = `${month}`;
            firstRow.appendChild(th)
    });
    
    
    //create the rows with data
    recordedData.forEach(record => {

        //create row for each record
        let tr = document.createElement('tr')      
        tableBody.appendChild(tr);


        //set student names
        let th = document.createElement('th')       
            th.innerHTML = record.student
            tr.appendChild(th);

        //set values
        let values = record.values;
        values.forEach(value => {

            //create td for each value
            let td = document.createElement('td')      
            td.innerHTML = value
            tr.appendChild(td);

            //depending on value, add a hover color (defined in CSS)
            if(value >= 5){
                td.setAttribute('class', 'hoverPostive')
            }else{
                td.setAttribute('class', 'hoverNegative')
            }


        });

    });

}

function fillSelect(recordedData){
    //remove previous options
    selectCont.innerHTML = ``;

    //add standard option
    let option = document.createElement('option')
            option.textContent = `Select a name to see individual data`
            option.setAttribute('selected', 'true')
            option.setAttribute('disabled', 'true')
    selectCont.appendChild(option)

    //loop over the options and create an option tag for each to append to the selectCont
    //values given to the options are the profiles --> link with profiles
    recordedData.forEach(record => {
        
        let option = document.createElement('option')
            option.textContent = record.student
            option.setAttribute('value', `${record.profile}`)
        
        selectCont.appendChild(option)
    });
}

function createCard(cardContainer, filteredRecordedData, profileData){
    //remove previously generated cards
    cardContainer.innerHTML = ``;

    //create elements and give right classes and IDs
    let card = document.createElement('div')
        card.setAttribute('class', 'card')
        card.setAttribute('style', 'width: 18rem;')
    let cardBody = document.createElement('div')
        cardBody.setAttribute('class', 'card-body')
    let cardTitle = document.createElement('h5')
        cardTitle.setAttribute('class', 'card-title')
        cardTitle.setAttribute('id', 'name')
    let cardSubtitle = document.createElement('h6')
        cardSubtitle.setAttribute('class', 'card-subtitle mb-2 text-muted')
        cardSubtitle.setAttribute('id', 'functie')
    let cardText1 = document.createElement('p')
        cardText1.setAttribute('class', 'card-text')
        cardText1.setAttribute('id', 'hobby')
    let cardText2 = document.createElement('p')
        cardText2.setAttribute('class', 'card-text')
        cardText2.setAttribute('id', 'scores')

    //append elements
    cardContainer.appendChild(card);
    card.appendChild(cardBody);
    cardBody.appendChild(cardTitle)
    cardBody.appendChild(cardSubtitle)
    cardBody.appendChild(cardText1)
    cardBody.appendChild(cardText2)

    //set the data in the elements
    cardTitle.textContent = filteredRecordedData[0].student
    if(profileData ==''){ //profile data is leeg indien nieuw gecreeerde data
        cardSubtitle.textContent = "Create a profile to see the function"
        cardText1.textContent = "Create a profile to see the hobbies"
    }else{
        cardSubtitle.textContent = profileData.functie
        cardText1.textContent = profileData.hobbies.join(', ') 
    }
    cardText2.innerHTML = filteredRecordedData[0].values.join(' ')


}

function drawGraph(filteredRecordData, recordedMonths){
    //get the canvas
    let canvas = document.getElementById('scorechart')

    // new Chart(canvas, 
    //     {
    //         type: 'line',
    //         data: {
    //             labels: recordedMonths ,
    //             datasets: filteredRecordData
    //         }

    //     })
}

function submit(recordedData){

    //get name and values from form and put the values in an array
    let inputName = document.getElementById('inputName').value
    
    let inputNumbers = [];
    let inputNumberFields = document.querySelectorAll(`input[type = 'number']`)
    inputNumberFields.forEach(inputNumberField => {
        inputNumbers.push(inputNumberField.value)
    });


    //Validate input - loop through the values and check if they match the validation criteria
    //if no, the errorCounter will be >0
    let errorCounter = 0;
    if(inputName.length <2 || inputName.length >25){
        errorCounter++
    }
    else{
        inputNumbers.forEach(number => {
            if(number<0 || number >10){
                errorCounter++
            }
        });
    }

    if(errorCounter>0){
        //more than one error, so show the error message
        showAlertError()
    }else{
        //show alert success
        showAlertSuccess()

        //write inputted data into the recordedData array
            //create object based on inputed data --> profile is emty because there is no profile file for them
            const record = {
                student:  inputName,
                values: inputNumbers,
                profile: "Unknown profile"
            }

            //add obj to array
            recordedData.push(record)

            //remake the group table and individual data based on new recordedData
            createGroupTable(recordedMonths, recordedData)
            fillSelect(recordedData)

            console.log(recordedData)

        //clear data from form as submission was successful
        clearForm()
    }



}

function showAlertSuccess(){
    let successAlert = document.getElementById("succesAlert")
    let errorAlert = document.getElementById("errorAlert")
    successAlert.classList.remove('hidden')
    errorAlert.classList.add('hidden')
}

function showAlertError(){
    let successAlert = document.getElementById("succesAlert")
    let errorAlert = document.getElementById("errorAlert")
    successAlert.classList.add('hidden')
    errorAlert.classList.remove('hidden')
}

function clearForm() {
    let inputs = document.querySelectorAll(`.input-group input`)
    
    inputs.forEach(input => {
        input.value = ``
    });
}