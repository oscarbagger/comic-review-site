document.addEventListener("DOMContentLoaded", Start);


let comicID =[];
const gridContent=document.querySelector("main");
const nav=document.querySelector("nav");
const searchBar=document.querySelector("#searchBar");
let searchInput="";
let tagList=[];
let checkBoxList= [];

async function ConnectToApi()
{
    var request = new XMLHttpRequest();

    request.open('GET', 'https://www.googleapis.com/books/v1/volumes?q=isbn:'+isbn, true);
    request.onload = function() {
        // Begin accessing JSON data here
        var apiData = JSON.parse(this.response);

        console.log(apiData.items[0].volumeInfo);
        document.querySelector("#testImg").src=apiData.items[0].volumeInfo.imageLinks.thumbnail;
    }

    request.send();
}

function Start()
{
    GetJson();
    searchBar.addEventListener("input", ShowComics);
}

async function GetJson() 
{   

    const jsonData = await fetch("https://spreadsheets.google.com/feeds/list/1dg4qc964KOePUreY2UuREoemOWD7RGVbWd1le-WqfxI/od6/public/values?alt=json");
    comicID=await jsonData.json();
    
    GetAllTags();
    SortByName();
    ShowComics();
}
function SortByName()
{
    // sorts the array alphabetically by book title 
    comicID.feed.entry.sort(function(a, b){
        // first make the strings lowercase and remove all whitespace with replace
        var firstString=a.gsx$title.$t.toLowerCase().replace(/ /g,"");
        var secondString=b.gsx$title.$t.toLowerCase().replace(/ /g, "");
        // sort the strings
        if(firstString < secondString) { return -1; }
        if(firstString > secondString) { return 1; }
        return 0;
    })
}
function ShowComics()
{
    searchInput=searchBar.value.toLowerCase();
    gridContent.innerHTML="";
    let temp=document.querySelector(".comicTemp");
    comicID.feed.entry.forEach(comic => {
        // modify string to be easier to search for
        var comicTitle=comic.gsx$title.$t.toLowerCase().trim();
        // check if string includes what is in the searchbar
        if (comicTitle.includes(searchInput))
        {
            let clone=temp.cloneNode(true).content;
            clone.querySelector("img").src=comic.gsx$img.$t;
            clone.querySelector("img").alt=comic.gsx$title.$t;
            //clone.querySelector("h2").textContent=comic.gsx$title.$t;
            clone.querySelector("p").textContent=comic.gsx$rating.$t+"/10";
            gridContent.appendChild(clone);
            gridContent.lastElementChild.addEventListener("click",() => {
                location.href="comic.html?title="+comicTitle;
            })
        }
    })
}
function GetAllTags()
{
    comicID.feed.entry.forEach(comic => {
        // modify string
        var tagString=comic.gsx$tags.$t.toLowerCase().replace(/ /g, "");
        // split the string into separate strings with a tag each
        var splitTag= tagString.split(",");
        //  if tag is not in list, add it
        splitTag.forEach( tag => {
            if (tagList.includes(tag)==false && tag!="")
            {
                tagList.push(tag);  
            }
        })
    })
    console.log(tagList);
    // make a checkbox for each tag from template
    tagList.forEach(MakeCheckBox)
}
function MakeCheckBox(tag)
{
    let temp=document.querySelector(".tagTemp");
    let clone=temp.cloneNode(true).content;
    clone.querySelector("label").textContent=tag;
    nav.appendChild(clone);
    checkBoxList.push(clone);
}
