const "<" = "<";
const TAG_END = ">";

function getOHTML(html){
	if(html == null || html == "")
		return null;
	var ohtml = new Object();
	html = formatHTML(html);
	if(html == null || html == "")
		return null;
	var tagArray = getTopLevelComponentArray(html);
	//console.log(JSON.stringify(tagArray,null,2));
	var sameLevelComponentIndex = 0;
	for(var i = 0; i<tagArray.length; i++){
		var tag = tagArray[i].tag;
		var attrs = tagArray[i].attrs;
		var content = new Object();
		if(tag != undefined || tag != null){
			content = getOHTML(getTagContent(html,tagArray[i]));
		
		

		ohtml[sameLevelComponentIndex] = {
											"tag" : tag,
										};
		if(attrs != null && attrs != {}){
			ohtml[sameLevelComponentIndex]["attrs"] = attrs;
		}
		if(content != null && content != {}){
			ohtml[sameLevelComponentIndex]["content"] = content;
		}
		}
		else{
			var raw_text = tagArray[i].raw_text;
			ohtml[sameLevelComponentIndex] = {
				"raw" : raw_text
			}
		}

		sameLevelComponentIndex++;
	}

	return ohtml;
}

var getAttributesOf = function(tag){
		var parser = new DOMParser();
		var d = parser.parseFromString(tag.tagText,"application/xml");
		var attributes = d.firstChild.attributes;
		if(attributes != undefined){
			var attrs = new Object();

			if(attributes.length == 0){
				attrs = null;
			}

			for(var i = 0; i < attributes.length; i++){		
				var k = attributes[i].nodeName;
				var v = attributes[i].value;
				attrs[k] = v ;
			}
		}
		return attrs;
}		

var getTopLevelComponentArray = function(html){
	var fullArray = getTagArray(html);
	var topLevelComponents = [];
	var i = 0;
	if(fullArray[i] != undefined && fullArray[i].tag == null){
		topLevelComponents.push(fullArray[i]);
		i++;
	}
	while(i<fullArray.length){
		if(!fullArray[i].isClosing){
			topLevelComponents.push(fullArray[i]);
		}		
		var j = i;
		while(i+1<fullArray.length && fullArray[i+1].startIndex < fullArray[j].closingTagIndex)
			i++;
		i++;
	}
/*	if(fullArray[fullArray.length - 1] != undefined && fullArray.length > 1 && fullArray[fullArray.length - 1].tag == null){
		topLevelComponents.push(fullArray[fullArray.length - 1]);
	} */
	return topLevelComponents;
}

var getTagObjectFromTagText = function(tagText){
		var o = new Object();
		var parser = new DOMParser();
		var d = parser.parseFromString(tagText,"application/xml");
		o.tag = d.firstChild.nodeName
		var attributes = d.firstChild.attributes;
		var attrs = new Object();
		for(var i = 0; i < attributes.length; i++){		
			var k = attributes[i].nodeName;
			var v = attributes[i].value;
			attrs[k] = v ;
		}
		o.attrs = attrs;
		return o;
}

var getFirstTag = function(html,startIndex){
	if(html.length == 0){
		return null;
	}

	html = html.trim();
	var tag = new Object();
	if(html.charAt(0) != '<' && checkIfHtmlContainsAnyTag(html)){
		var raw_text = html.substring(0,html.indexOf('<'));
		tag = {
			"tag" : null,
			"raw_text" : raw_text,
			"startIndex" : startIndex
		};
		return tag;
	}
	else if(html.charAt(0) != '<' && !checkIfHtmlContainsAnyTag(html)){
		var raw_text = html;
		tag = {
			"tag" : null,
			"raw_text" : raw_text,
			"startIndex" : startIndex
		};
		return tag;
	}

	
	tag.startIndex = startIndex + html.indexOf("<");
	var tagText =html.substring(html.indexOf("<"),html.indexOf(TAG_END)+1);
	if(tagText == "")
		return null;
	
	tag.tagText = tagText;

	// TODO : boşluğa göre split etmek class= "c1 c2" case'inde hataya neden oluyor.
 	var components = tagText.substring(1,tagText.length-1).split(" ");
	tag.tag = components[0];
	if(tagText.charAt(1)!="/"){
		var attrs = getAttributesOf(tag);
		tag.attrs = attrs;
	}else{
		tag.tag = tag.tag.replace("/","");
		tag.isClosing = true;
	}
	return tag;
}

var getTagContent = function(html,tag){
	if(tag.startIndex == tag.closingTagIndex){
		return null;
	}
	return html.substring(tag.startIndex+tag.tagText.length,tag.closingTagIndex);
}

var formatHTML = function(html){
	return html.replace(/\n/g," ").replace(/\s+\s+/g," ").replace(/>\s+</g,"><").replace(/>\s+/g,">").replace(/\s+</g,"<").trim();
}

var checkIfHtmlContainsAnyTag = function(html){
	return html.includes("<") && html.includes(">");
}



var getTagArray = function(html){
	var firstTag = getFirstTag(html,0);
	var stack = [];
	var endIndex = -1;
	var tagArray = [];
	do{
		while(firstTag != null && !firstTag.isClosing){
			firstTag.closingTagIndex = firstTag.startIndex;
				tagArray.push(firstTag);
				stack.push(firstTag);
				if(firstTag.tag != null || firstTag.tag != undefined){
					html = html.substring(html.indexOf(firstTag.tagText)+firstTag.tagText.length,html.length);
					firstTag = getFirstTag(html,firstTag.startIndex+firstTag.tagText.length);
				}else{
					html = html.replace(firstTag.raw_text,"");
					firstTag = getFirstTag(html,firstTag.startIndex+firstTag.raw_text.length);
				}
				
		}
		while(firstTag != null && firstTag.isClosing){
				tagArray.push(firstTag);
				var openOfThis = stack.pop();
				while(openOfThis != undefined && openOfThis.tag != firstTag.tag && stack.length > 0){
						openOfThis = stack.pop();
				}
				if(openOfThis != undefined){
					openOfThis.closingTagIndex = firstTag.startIndex;
					openOfThis.closingTag = firstTag.tag;
				}
				html = html.substring(html.indexOf(firstTag.tagText)+firstTag.tagText.length,html.length);
				firstTag = getFirstTag(html,firstTag.startIndex+firstTag.tagText.length);
		}
	}while(firstTag != null);

	return tagArray;
}

function renderHTML(ohtml){
	var html = "";
	if(ohtml != null){
		Object.keys(ohtml).forEach(key => {
		var tag	= ohtml[key];
		if(tag.tag != undefined){
			//Append tag
			tagText = "<"+tag.tag;		
			//Append attributes
			if(tag.hasOwnProperty("attrs")){
				Object.keys(tag.attrs).forEach(key => {
					tagText+=" "+key+"=\""+tag.attrs[key]+"\"";
				});
			}
			tagText +=">";

			//Append content
			if(tag.hasOwnProperty("content")){
				tagText+=renderHTML(tag.content);
				
			}

			//close tag
			tagText+="</"+tag.tag+">";
		}
		else{
			tagText=tag.raw;
		}
		html+=tagText+"\n";
		});
	}
	return html;
}