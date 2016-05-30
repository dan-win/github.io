// PCA-validation-sample.js
// PCA validation sample -  http://www.pcapredict.com/Support/WebService/CapturePlus/Interactive/Find/2.1/

function CapturePlus_Interactive_Find_v2_10Begin(Key, SearchTerm, LastId, SearchFor, Country, LanguagePreference, MaxSuggestions, MaxResults) {
    var script = document.createElement("script"),
        head = document.getElementsByTagName("head")[0],
        url = "http://services.postcodeanywhere.co.uk/CapturePlus/Interactive/Find/v2.10/json3.ws?";

    // Build the query string
    url += "&Key=" + encodeURIComponent(Key); // = my key
    url += "&SearchTerm=" + encodeURIComponent(SearchTerm);
    url += "&LastId=" + encodeURIComponent(LastId);
    url += "&SearchFor=" + encodeURIComponent(SearchFor); // = PostalCodes
    url += "&Country=" + encodeURIComponent(Country); // = GBR
    url += "&LanguagePreference=" + encodeURIComponent(LanguagePreference); // = EN
    url += "&MaxSuggestions=" + encodeURIComponent(MaxSuggestions);
    url += "&MaxResults=" + encodeURIComponent(MaxResults);
    url += "&callback=CapturePlus_Interactive_Find_v2_10End";

    script.src = url;

    // Make the request
    script.onload = script.onreadystatechange = function () {
        if (!this.readyState || this.readyState === "loaded" || this.readyState === "complete") {
            script.onload = script.onreadystatechange = null;
            if (head && script.parentNode)
                head.removeChild(script);
        }
    }

    head.insertBefore(script, head.firstChild);
}

function CapturePlus_Interactive_Find_v2_10End(response) {
    // Test for an error
    if (response.Items.length == 1 && typeof(response.Items[0].Error) != "undefined") {
        // Show the error message
        alert(response.Items[0].Description);
    }
    else {
        // Check if there were any items found
        if (response.Items.length == 0)
            alert("Sorry, there were no results");
        else {
            // PUT YOUR CODE HERE
            //FYI: The output is an array of key value pairs (e.g. response.Items[0].Id), the keys being:
            //Id
            //Text
            //Highlight
            //Cursor
            //Description
            //Next
        }
    }
}

// Error codes: see: http://www.pcapredict.com/Support/WebService/CapturePlus/Interactive/Find/2.1/

/* Short reference about fields:

Name    Type    Description                                     Values                      Example
Id      String  The Id to be used as the LastId with the Find method.                       GBR|ST|27299|3739|6|0|0|
Text    String  The found item.                                                             High Street, London
Highlight   String  A list of number ranges identifying the characters to highlight in the Text response (zero-based start position and end).   

                                                                                            0-2,6-4
Cursor  Integer     A zero-based position in the Text response indicating the suggested position of the cursor if this item is selected. A -1 response indicates no suggestion is available.    

                                                                                            0
Description     String  Descriptive information about the found item, typically if it's a container.    

                                                                                            102 Streets
Next    String  The next step of the search process.    

                                                                Find
                                                                Retrieve
*/