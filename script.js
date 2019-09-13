document.addEventListener("DOMContentLoaded", Start);


let comicList =[];
const gridContent=document.querySelector("main");
const navTagList=document.querySelector("#tagList");
const searchBar=document.querySelector("#searchBar");
let searchInput="";
let tagList=[];
let tagFilterList= [];

function Start()
{
    GetJson();
    searchBar.addEventListener("input", ShowComics);
}

async function GetJson() 
{   

    const jsonData = await fetch("https://spreadsheets.google.com/feeds/list/1dg4qc964KOePUreY2UuREoemOWD7RGVbWd1le-WqfxI/od6/public/values?alt=json");
    comicList=await jsonData.json();
    // run some start-up functions
    GetAllTags();
    SortByName(true);
    ShowComics();
}
function SortByName(aToZ)
{
    // sorts the array alphabetically by book title 
    comicList.feed.entry.sort(function(a, b){
        // first make the strings lowercase and remove all whitespace with replace
        var firstString=a.gsx$title.$t.toLowerCase().replace(/ /g,"");
        var secondString=b.gsx$title.$t.toLowerCase().replace(/ /g, "");
        // sort the strings
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
        // sort the strings
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
    gridContent.innerHTML="";
    let temp=document.querySelector(".comicTemp");
    comicList.feed.entry.forEach(comic => {
        // modify string to be easier to search for
        var comicTitle=comic.gsx$title.$t.toLowerCase().trim();
        var comicAuthor=comic.gsx$author.$t.toLowerCase().trim().replace(/, /g, "");
        // make a list of this comics tags
        var comicTags=GetComicsTagList(comic.gsx$tags.$t);
        // check if string includes what is in the searchbar, and in the filter
        if (comicTitle.includes(searchInput) && allIndexesIncluded(comicTags,tagFilterList) || comicAuthor.includes(searchInput) && allIndexesIncluded(comicTags,tagFilterList) )
        {
            let clone=temp.cloneNode(true).content;
            clone.querySelector("img").src=comic.gsx$img.$t;
            clone.querySelector("img").alt=comic.gsx$title.$t;
            clone.querySelector("p").textContent=comic.gsx$rating.$t+"/10";
            gridContent.appendChild(clone);
            gridContent.lastElementChild.addEventListener("click",() => {
                location.href="comic.html?title="+comicTitle;
            })
        }
    })
}
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

function GetComicsTagList(str)
{
    var tagString=str.toLowerCase().replace(/ /g, "");
    var allTags=tagString.split(",");
    allTags.sort();
    return allTags;
}
function GetAllTags()
{
    comicList.feed.entry.forEach(comic => {
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
    // sort list
    tagList.sort();
    // make a checkbox for each tag from template
    tagList.forEach(MakeCheckBox);
    
}
function MakeCheckBox(tag)
{
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
