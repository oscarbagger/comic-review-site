document.addEventListener("DOMContentLoaded", GetJson);


let comicList =[];
const gridContent=document.querySelector("main");
const navTagList=document.querySelector("#tagList");
const searchBar=document.querySelector("#searchBar input");
const filterButton=document.querySelector("#filterButton input");
// is the list of filters visible.
let filterOpen=false;
// text in the searchbar
let searchInput="";
// array of available tags/genres
let tagList=[];
// array of tags/genres currently active as filters.
let tagFilterList= [];

async function GetJson() 
{   
    // fetch json data from spreadsheet
    const jsonData = await fetch("https://spreadsheets.google.com/feeds/list/1dg4qc964KOePUreY2UuREoemOWD7RGVbWd1le-WqfxI/od6/public/values?alt=json");
    comicList=await jsonData.json();
    // run some start-up functions
    GetAllTags();
    SortByName(true);
    ShowComics();
    EventListenerAdd();
}

function EventListenerAdd()
{
    // every time you write in searchbar, run ShowComics()
    searchBar.addEventListener("input", ShowComics);
    // toggle the filterlist open/closed.
    filterButton.addEventListener("click", ToggleFilters => {
        if (filterOpen)
        {
            filterButton.value="Filters +"
            filterOpen=false;
        } else 
        {
            filterButton.value="Filters -"
            filterOpen=true;
        }
        navTagList.classList.toggle("hidden");
    });
}

function SortByName(aToZ)
{
    // sorts the array alphabetically by book title 
    comicList.feed.entry.sort(function(a, b){
        // first make the strings lowercase and remove all whitespace with replace
        var firstString=a.gsx$title.$t.toLowerCase().replace(/ /g,"");
        var secondString=b.gsx$title.$t.toLowerCase().replace(/ /g, "");
        // sort the strings, reverse the proccess if aToZ is false
        if (aToZ)
        {
            if(firstString <  secondString) { return -1; }
            if(firstString > secondString) { return 1; }
        }
        else 
        {
            if(firstString >  secondString) { return -1; }
            if(firstString < secondString) { return 1; }
        }

        return 0;
    })
}
function SortByRating(highToLow)
{
    // sorts the array alphabetically by book title 
    comicList.feed.entry.sort(function(a, b){
        // first make the strings lowercase and remove all whitespace with replace
        var firstString=parseInt(a.gsx$rating.$t.replace(/ /g,""),10);
        var secondString=parseInt(b.gsx$rating.$t.replace(/ /g, ""),10);
        // sort the strings, reverse the process if highToLow is false
        if (highToLow)
            {
                if(firstString > secondString) { return -1; }
                if(firstString < secondString) { return 1; }
            }
        else {
            if(firstString < secondString) { return -1; }
            if(firstString > secondString) { return 1; }
        }
        return 0;
    })
}
function ShowComics()
{
    searchInput=searchBar.value.toLowerCase();
    // empty the content of the grid
    gridContent.innerHTML="";
    // get the template for a grid item
    let temp=document.querySelector(".comicTemp");
    comicList.feed.entry.forEach(comic => {
        // modify string to be easier to search for
        var comicTitle=comic.gsx$title.$t.toLowerCase().trim();
        var comicAuthor=comic.gsx$author.$t.toLowerCase().trim().replace(/, /g, "");
        // make a list of this comics tags
        var comicTags=GetThisComicsTags(comic.gsx$tags.$t);
        // check if string includes what is in the searchbar, and in the filter
        if (comicTitle.includes(searchInput) && allIndexesIncluded(comicTags,tagFilterList) || comicAuthor.includes(searchInput) && allIndexesIncluded(comicTags,tagFilterList) )
        {
            let clone=temp.cloneNode(true).content;
            clone.querySelector("img").src=comic.gsx$img.$t;
            clone.querySelector("img").alt=comic.gsx$title.$t;
            clone.querySelector("p").textContent=comic.gsx$rating.$t+"/10";
            gridContent.appendChild(clone);
            // eventlistener to go to singleview
            gridContent.lastElementChild.addEventListener("click",() => {
                location.href="comic.html?title="+comicTitle;
            })
        }
    })
}
// compare two arrays, to see if all index values of arr is part of includedIn, return true or false
function allIndexesIncluded(arr,includedIn)
{
    // check if all values from arr is in includedIn
    if(arr==includedIn) {return true;}
    if (arr == null || includedIn == null) {return true;} 

    var matches=0;
    // how many filters it needs to match with
    var matchesNeeded=includedIn.length;
    // for each index of arr go through IncludedIn to see if they match
    for (var i = 0; i < includedIn.length; ++i) {
        for (var j=0; j<arr.length; j++) {
            if (arr[j] == includedIn[i])
                {
                    matches++;
                }
        }
    }
    // if all values of arr has matched with a value from includedIn return true
    if (matches==matchesNeeded) {return true;}
        else {return false;}
}
// get all tags for a single comic
function GetThisComicsTags(str)
{
    // make the string lowercase and remove whitespace
    var tagString=str.toLowerCase().replace(/ /g, "");
    // split the string into separate tags wherever there is a comma
    var allTags=tagString.split(",");
    allTags.sort();
    return allTags;
}
// make an array of all unique tags from the comicList
function GetAllTags()
{
    comicList.feed.entry.forEach(comic => {
        // modify string
        var tagString=comic.gsx$tags.$t.toLowerCase().replace(/ /g, "");
        // split the string into separate strings with a tag each
        var splitTag= tagString.split(",");
        // if tag is not in list, add it
        splitTag.forEach( tag => {
            if (tagList.includes(tag)==false && tag!="")
            {
                tagList.push(tag);  
            }
        })
    })
    // sort list
    tagList.sort();
    // make a checkbox for each tag from template
    tagList.forEach(MakeCheckBox);
    
}
function MakeCheckBox(tag)
{
    // get the template for a checkbox
    let temp=document.querySelector(".tagTemp");
    let clone=temp.cloneNode(true).content;
    clone.querySelector("label").textContent=tag;
    navTagList.appendChild(clone);
    // on click, add or remove the tag from my list of tagFilters.
    navTagList.lastElementChild.querySelector("input").addEventListener("click",() => {
        if (tagFilterList.includes(tag))
        {
            var index = tagFilterList.indexOf(tag);
            tagFilterList.splice(index, 1); 
        }
        else 
        {
            tagFilterList.push(tag);
        }
        tagFilterList.sort();
        ShowComics();
    })
}
