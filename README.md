#ImgPos
Resizing and positioning images to fit or fill their offset container

##Features
+ Adjusting image position to fit its offset parent
+ Re-adjust position when image src changed
+ Declarative boot support with data-* attributes
+ Backward compatible with Internet Explorer 8 (and even 7)

##Requirements
dependencies

+ jQuery

on image itself

+ no inline style.
+ style position can only be absolute

on image offset parent

+ style position can not be static
+ fixed width and height need to be set

##Usage

Here is a [ImgPos Usage Demo](https://fuweichin.github.io/imgpos/demo/demo.html).

Assuming you have an image list like this
```html
<ul class="centered-image-list image-list tile-list">
    <li><a href="" ><img src="images/camomile-240x135.jpg" alt="" /></a></li>
    <li><a href="" ><img src="images/camomile-240x150.jpg" alt="" /></a></li>
    <li><a href="" ><img src="images/camomile-200x150.jpg" alt="" /></a></li>
    <li><a href="" ><img src="images/camomile-150x200.jpg" alt="" /></a></li>
    <li><a href="" ><img src="images/camomile-480x270.jpg" alt="" /></a></li>
    <li><a href="" ><img src="images/camomile-480x300.jpg" alt="" /></a></li>
    <li><a href="" ><img src="images/camomile-400x300.jpg" alt="" /></a></li>
    <li><a href="" ><img src="images/camomile-300x400.jpg" alt="" /></a></li>
</ul>
```
Let's import jQuery and imgpos, then invoke the imgpos on document load
```html
<script src="jquery.js"></script>
<script src="imgpos.js"></script>
```

```javascript
jQuery(function($){
	$(".centered-image-list img").imgpos({
    	imageScale: "none",
        imagePosition: "center center"
    })
});
```
or, use the declarative boot:
```html
<script src="imgpos.js" data-query=".image-list img"
			data-image-scale="fit" data-image-position="center center"
			data-offset-parent-function="return this.parentElement"></script>
```
The `data-query` attribute will be used to specify the a selector (which is natively supported by the browser), imgpos will use that selector to query targeting images, and the rest `data-*` attributes will be used as options-to-be for imgpos invocation.
In other words, the code above works equivalent to
```html
<script src="imgpos.js"></script>
```
plus
```javascript
jQuery(document.querySelector(".image-list img")).imgpos({
	imageScale: "fit",
	imagePosition: "center center",
    offsetParentFunction:new Function("return this.parentElement")
});
```
Note: Declarative boot doesn't work under these circumstances: the browser doesn't have feature `document.currentScript` and, in the meanwhile, the author are loading imgpos.js asynchronously.

##Options
<table>
<thead>
	<tr>
		<th>Name</th>
		<th>Type</th>
		<th>Default</th>
		<th>Description</th>
	</tr>
</thead>
<tbody>
	<tr>
		<td>imageScale</td>
		<td>String</td>
		<td>"fit"</td>
		<td>"none" | "fit" | <span style="text-decoration:line-through;">"scale"</span> "fill"</td>
	</tr>
	<tr>
		<td>imagePosition</td>
		<td>String</td>
		<td>"center center"</td>
		<td>imagePosition: *positionX* *positionY* | *positionXOrY*<br/>
		positionX: "left" | "center" | "right"<br/>
		positionY: "top" | "center" | "bottom"<br/>
		positionXOrY: *positionX* | *positionX*
		</td>
	</tr>
	<tr>
		<td>offsetParentFunction</td>
		<td>Function</td>
		<td>function(){<br />return this.parentElement;<br />}</td>
		<td>callback to specify the offset-parent to be of each image.<br />its return-value will be used as offset-parent</td>
	</tr>
	<tr>
		<td>ensureParentPositioned</td>
		<td>Function</td>
		<td>function(){}</td>
		<td>callback to let authors ensure that the offset-parent of each image is positioned<br/>
		contextual `this` means the offset-parent of each image</td>
	</tr>
</tbody>
</table>
