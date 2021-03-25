//using a polyfill for safary to have smooth scroling behavior. for more info: https://github.com/iamdustan/smoothscroll
// using jQuery
// using Images Loaded, a jquery plugin for triggering when image is loaded
// <script src='https://unpkg.com/smoothscroll-polyfill@0.4.4/dist/smoothscroll.min.js'></script>
// <script src='https://cdnjs.cloudflare.com/ajax/libs/jquery/3.5.1/jquery.min.js'></script>
// <script src='https://unpkg.com/imagesloaded@4/imagesloaded.pkgd.js'></script>

var activeImage = 0;
var allimages = $(".imgBox");
var allImagesPossitionLefts = [];

var imgs = [
    {
        alt: "Efes Antik Kenti, Selçuk, 2019 19.jpg",
        imgUrl: "https://upload.wikimedia.org/wikipedia/commons/1/14/Efes_Antik_Kenti%2C_Selçuk%2C_2019_19.jpg",
        commonsUrl: "https://commons.wikimedia.org/wiki/File:Efes_Antik_Kenti,_Selçuk,_2019_19.jpg",
        locatorUrl: "",
        imgLng: "",
        imgLat: ""
    },
    {
        alt: "Efes Antik Kenti, Selçuk, 2019 01.jpg",
        imgUrl: "https://upload.wikimedia.org/wikipedia/commons/1/1a/Efes_Antik_Kenti%2C_Selçuk%2C_2019_01.jpg",
        commonsUrl: "https://commons.wikimedia.org/wiki/File:Efes_Antik_Kenti,_Selçuk,_2019_01.jpg",
        locatorUrl: "",
        imgLng: "",
        imgLat: ""
    },
    {
        alt: "Efes Antik Kenti, Selçuk, 2019 36.jpg",
        imgUrl: "https://upload.wikimedia.org/wikipedia/commons/b/b0/Efes_Antik_Kenti%2C_Selçuk%2C_2019_36.jpg",
        commonsUrl: "https://commons.wikimedia.org/wiki/File:Efes_Antik_Kenti,_Selçuk,_2019_36.jpg",
        locatorUrl: "",
        imgLng: "",
        imgLat: ""
    },
    {
        alt: "Efes Antik Kenti, Selçuk, 2019 02.jpg",
        imgUrl: "https://upload.wikimedia.org/wikipedia/commons/b/ba/Efes_Antik_Kenti%2C_Selçuk%2C_2019_02.jpg",
        commonsUrl: "https://commons.wikimedia.org/wiki/File:Efes_Antik_Kenti,_Selçuk,_2019_02.jpg",
        locatorUrl: "",
        imgLng: "",
        imgLat: ""
    },
    {
        alt: "Efes Antik Kenti, Selçuk, 2019 35.jpg",
        imgUrl: "https://upload.wikimedia.org/wikipedia/commons/f/ff/Efes_Antik_Kenti%2C_Selçuk%2C_2019_35.jpg",
        commonsUrl: "https://commons.wikimedia.org/wiki/File:Efes_Antik_Kenti,_Selçuk,_2019_35.jpg",
        locatorUrl: "",
        imgLng: "",
        imgLat: ""
    },
    {
        alt: "Turkey-2752 - Ephesus (2216371615).jpg",
        imgUrl: "https://upload.wikimedia.org/wikipedia/commons/2/20/Turkey-2752_-_Ephesus_%282216371615%29.jpg",
        commonsUrl: "https://commons.wikimedia.org/wiki/File:Turkey-2752_-_Ephesus_(2216371615).jpg",
        locatorUrl: "",
        imgLng: "",
        imgLat: ""
    }
    // ,
    // {
    //    alt: "",
    //    imgUrl: "",
    //    commonsUrl: "",
    //    locatorUrl: "",
    //    imgLng: "",
    //    imgLat: ""
    // }
]


function resetCarouselContent(arrayOfImgObjs) {
    activeImage = 0
    $(".imgBox").remove()
    if (arrayOfImgObjs != undefined) {
        newImgBoxs(arrayOfImgObjs)
    }
}

function newImgBoxs(arrayOfImgObjs) {
    // expecting an object with: alt, imgUrl, commonsUrl, locatorUrl, imgLng, imgLat

    // === following 3 lines of commented code are for adding images to the end ===
    // var alreadyExistingImages = allimages.length;
    // console.log(alreadyExistingImages + " ============");
    for (i in arrayOfImgObjs) {
        // var idNbr = Number(i) + alreadyExistingImages;
        var idNbr = Number(i);
        var html = "";
        //prop.cameraLonLat
        html += '<div class="imgBox" id="imgBox' + idNbr + '"   data-lon="' + arrayOfImgObjs[i].imgLng + '" data-lat="' + arrayOfImgObjs[i].imgLat + '">';
        html +=
            '<img class="imgInBox" id="" onclick="displayImage()" src="' +
            arrayOfImgObjs[i].imgUrl +
            '" alt="' +
            arrayOfImgObjs[i].alt +
            '">';
        html += '<div class="infoInBox">';
        html += "<h3>" + arrayOfImgObjs[i].alt + "</h3>";
        if (arrayOfImgObjs[i].commonsUrl != undefined) {
            html += '<a href="https://commons.wikimedia.org/wiki/File:' + encodeURIComponent(arrayOfImgObjs[i].title) + '" target="_blank">Image Commons page</a>';
        }
        if (arrayOfImgObjs[i].commonsUrl != undefined) {
            html += '<a href="' + arrayOfImgObjs[i].commonsUrl + '" target="_blank">Full size image</a>';
        }
        if (arrayOfImgObjs[i].locatorUrl != undefined) {
            html += '<a href="https://locator-tool.toolforge.org/#/geolocate?files=File:' + encodeURIComponent(arrayOfImgObjs[i].title) + '" target="_blank">Image locator tool</a>';
        }
        if (arrayOfImgObjs[i].imgLng != undefined && arrayOfImgObjs[i].imgLat != undefined) {
            // var imgInfo = {
            //     "cameraLonLat": [arrayOfImgObjs[i].imgLat, arrayOfImgObjs[i].imgLng]
            // };
            // html += '<a href="" onclick="displayImage(' + JSON.stringify(imgInfo) + ')" target="_blank"> Images around this image </a> ';
            html += '<a href="https://www.google.com/maps/@?api=1&map_action=map&center=' + arrayOfImgObjs[i].imgLat + ',' + arrayOfImgObjs[i].imgLng + '&zoom=18&basemap=satellite" target="_blank">Google Maps</a>';
            html += '<a href="https://earth.google.com/web/@' + arrayOfImgObjs[i].imgLat + ',' + arrayOfImgObjs[i].imgLng + ',1000a,1000d,35y,0h,45t,0r/data=KAI" target="_blank">Google Earth Online</a>'; //https://www.gearthblog.com/blog/archives/2017/04/fun-stuff-new-google-earth-url.html
            html += '<a href="https://bing.com/maps/default.aspx?cp=' + arrayOfImgObjs[i].imgLat + '~' + arrayOfImgObjs[i].imgLng + '&lvl=18&style=a" target="_blank">Bing Maps</a>';
            html += '<a href="https://yandex.com/maps/?l=sat&ll=' + arrayOfImgObjs[i].imgLng + '%2C' + arrayOfImgObjs[i].imgLat + '&z=17" target="_blank">Yandex Maps</a>';
            html += '<a href="https://wego.here.com/?map=' + arrayOfImgObjs[i].imgLat + ',' + arrayOfImgObjs[i].imgLng + ',17,satellite&x=ep" target="_blank">Here Maps</a>';
            html += '<a href="https://wikishootme.toolforge.org/#lat=' + arrayOfImgObjs[i].imgLat + '&lng=' + arrayOfImgObjs[i].imgLng + '&zoom=18" target="_blank">WikiShootMe</a>';
        }
        html += "</div>";
        html += "</div>";
        $(html).insertBefore("#paddingLast");

    }
    allimages = $(".imgBox");

    $("#imgBox0 img").on("load", function () { // make sure first image is loaded before doing all calculations
        if (makeCarouselSectionVisible() != undefined) {
            makeCarouselSectionVisible();
        }
        widthOfFirstAndLastPaddingForCentering();
        activeteImageBox(activeImage);
    })
}

$(document).ready(function () {
    $("#container").on("scroll", function () {
        CheckForNewActiveImageBasedOnScroll(200); // on scroll check active image
    });
    $(window).on("resize", function () {
        // on resize recalculate scroll possitions
        calcScrollPositionsForWindowScroll();
    });
    // $(".imgBox.active").on("hover")
});

function activeteImageBox(imgNbr, delayTime) {
    if (delayTime === undefined) {
        delayTime = 0;
    }
    console.log(delayTime);
    activeImage = imgNbr;
    console.log("New active image: " + imgNbr);
    setTimeout(function () {
        $(".imgBox.active").removeClass("active").unbind("mouseenter mouseleave");
        $("#imgBox" + imgNbr).addClass("active");
        $(".imgBox.active").hover(
            function () {
                $(this).children("img").addClass("hover");
                $(this).children(".infoInBox").show();
            },
            function () {
                $(this).children("img").removeClass("hover");
                $(this).children(".infoInBox").hide();
            }
        );
    }, delayTime);
    var activeImgLonLat = [Number($("#imgBox" + imgNbr).attr("data-lon")), Number($("#imgBox" + imgNbr).attr("data-lat"))]
    console.log(activeImgLonLat)
    carouselPositionCallback(activeImgLonLat);
}

function widthOfFirstAndLastPaddingForCentering() {
    // $(".imgBox").first().width()
    // $(".imgBox").last().width()
    $("#paddingFirst").width(
        ($(window).width() - $(".imgBox").first().width()) / 2 - 10
    );
    $("#paddingLast").width(
        ($(window).width() - $(".imgBox").last().width()) / 2 - 10
    );
    calcScrollPositionsForWindowScroll();
}

function calcScrollPositionsForWindowScroll() {
    var allImagesWidths = [];
    var windowWidth = $(window).width();
    var paddingFirstWidth = $("#paddingFirst").width()
    var activeMargin = 2
    var margPad = 10;
    var lastPositionWithoutCentering = 0;
    allImagesPossitionLefts = [];
    $(".imgBox").each(function () {
        var width = $(this).width(); // 12 = margin? + border width
        allImagesWidths.push(width);
    });
    for (i in allImagesWidths) {
        if (i == 0) {
            var scrollPossition = paddingFirstWidth + activeMargin;
            lastPositionWithoutCentering = paddingFirstWidth + margPad;

        } else {
            // var lastPosition = allImagesPossitionLefts[allImagesPossitionLefts.length - 1]
            var lastImgWidth = allImagesWidths[i - 1]
            var centeringPadding = (windowWidth - allImagesWidths[i]) / 2;
            lastPositionWithoutCentering = lastPositionWithoutCentering + lastImgWidth + margPad + margPad;
            var scrollPossition = lastPositionWithoutCentering - centeringPadding;
        }
        // var scrollPossition =
        //     $(this).position().left - ($(window).width() - $(this).width()) / 2 + 12; // 12 = margin? + border width
        // if (scrollPossition < 0) {
        //     scrollPossition = 0;
        // }
        allImagesPossitionLefts.push(scrollPossition);
    }
    console.log("Img positions:");
    console.log(allImagesPossitionLefts);

}
function BACKUPcalcScrollPositionsForWindowScroll() {
    allImagesPossitionLefts = [];
    // console.log("Img positions:");
    // console.log(allImagesPossitionLefts);
    // if ($(".imgBox.active") != undefined) {
    //     if ($(".imgBox.active").position() != undefined) {
    //         if ($(".imgBox.active").position().left != undefined) {
    //             console.log($(".imgBox.active").position().left);
    //         }
    //     }
    // }
    $(".imgBox").each(function () {
        var scrollPossition =
            $(this).position().left - ($(window).width() - $(this).width()) / 2 + 12; // 12 = margin? + border width
        if (scrollPossition < 0) {
            scrollPossition = 0;
        }
        // else if (scrollPossition > $("#wrapper").width()) {
        //   scrollPossition = $("#wrapper").width() - 100;
        // }
        allImagesPossitionLefts.push(scrollPossition);
    });
    console.log("Img positions:");
    console.log(allImagesPossitionLefts);

}

// --- 3 exemples of valid function calls to move carousel ---
// ScrollToImg(8);
// ScrollToImg(undefined, true);
// ScrollToImg(undefined, false, true);

$(document).keydown(
    function(e)
    {    
        if (e.keyCode == 39) {      
            ScrollToImg(undefined, true);

        }
        if (e.keyCode == 37) {      
            ScrollToImg(undefined, false, true);

        }
    }
);



function ScrollToImg(imgNbr, next, previous) {

    var scrollTime = 200; // time it takes to make the scroll
    if (next) {
        var imgNbr = Number(activeImage) + 1;
        if (imgNbr > allImagesPossitionLefts.length - 1) {
            //if the next img is after the last one
            imgNbr = 0; // select first image
            scrollTime = scrollTime * 3;
            activeteImageBox(imgNbr, scrollTime);
        } else {
            activeteImageBox(imgNbr, scrollTime);
        }
        $("#container").animate(
            { scrollLeft: allImagesPossitionLefts[activeImage], behavior: "smooth" },
            scrollTime
        );
    } else if (previous) {
        var imgNbr = activeImage - 1;
        if (imgNbr < 0) {
            imgNbr = allImagesPossitionLefts.length - 1;
            activeteImageBox(imgNbr, scrollTime);
            scrollTime = scrollTime * 3;
        } else {
            activeteImageBox(imgNbr, scrollTime);
        }
        $("#container").animate(
            { scrollLeft: allImagesPossitionLefts[activeImage], behavior: "smooth" },
            scrollTime
        );
    } else {
        if (imgNbr > allImagesPossitionLefts.length - 1) {
            imgNbr = 0;
        } else if (imgNbr < 0) {
            imgNbr = allImagesPossitionLefts.length - 1;
        }
        activeteImageBox(imgNbr);
        $("#container").animate(
            { scrollLeft: allImagesPossitionLefts[activeImage], behavior: "smooth" },
            scrollTime
        );
    }
    calcScrollPositionsForWindowScroll();

}

function CheckForNewActiveImageBasedOnScroll(scrolltimeWait) {
    setTimeout(function () {
        // determin new active image based on scroll position
        var scrollPosition = $("#container").scrollLeft();
        for (i in allImagesPossitionLefts) {
            // see for all images if it is within range of being active
            if (
                // if scroll postiono of window is within 25 of scroll position of img
                allImagesPossitionLefts[i] < scrollPosition + 25 &&
                allImagesPossitionLefts[i] > scrollPosition - 25
            ) {
                activeteImageBox(i); // if true activate that image
            }
        }
        if (
            scrollPosition >
            allImagesPossitionLefts[allImagesPossitionLefts.length - 2] + 200 // compage scrolle to befor last possition plus some room for error, 200 here
        ) {
            activeteImageBox(allImagesPossitionLefts.length - 1);
            // activeImage = allImagesPossitionLefts.length - 1; // activate last
        }
    }, scrolltimeWait);
}

