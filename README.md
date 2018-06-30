What is OHTML and OHTML.JS?
===========================
**ohtml**is a json notation standart for html pages and **ohtml.js** is a html-to-json and json-to-html converter based on ohtml standart.

## An example ohmtl represantation of
	<div class="top-div-of-example top-class" id="div1">
		<a href="https://github.com/ouozavci/ohtml">A link to ohtml repo!</a>
	</div>

## is	
	{
		"0":{
			"tag":"div",
			"attrs":{
				"class":"top-div-of-example top-class",
				"id":"div1"
			},
			"content":{
				"0":{
					"tag":"a",
					"attrs":{
						"href":"https://github.com/ouozavci/ohtml"
					},
					"content":{
						"raw_text" : "A link to ohtml repo!" 
					}
				}
			}

		}
	}
