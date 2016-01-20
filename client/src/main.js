/* global $, mina */
/* eslint-env browser */
/* eslint strict:0, no-console:0 */
'use strict';
global.$ = global.jQuery = require('jquery');

/*
	Customisation
	?primaryType=topStories
	&primarySearch=
	&primaryOffset=0
	&primaryMax=3
	&secondaryType=search
	&secondarySearch=banks
	&secondaryOffset=0
	&secondaryMax=10
*/

const serviceUrl = '/data';
const topStoriesUrl = serviceUrl + '/top-stories';

/*function wait (ms) {
	return new Promise(function (resolve) {
		setTimeout(resolve, ms);
	});
}*/

function getTopStories (offset, amount) {
	return fetch(topStoriesUrl + '?startFrom=' + offset + '&numberOfArticles=' + amount)
		.then(function (response) {
			return response.json();
		})
	;
}

const __dash = (function (){

	const headlinesContainer = document.querySelector('.articles');
	const storedConfiguration = JSON.parse(localStorage.getItem('dash-config'));

	const configuration = (function (){

		const el = document.querySelector('.config')
		const slider = el.querySelector('.slider');
		const sliderHolder = slider.parentNode;
		const rotatable = el.querySelector('.rotatable');
		const saveBtn = el.querySelector('.save_config');

		let angleValue = 0;
		let scaleValue = 1;

		function showConfigurationScreen (){
			el.setAttribute('data-visible', 'true');
			document.body.style.transform = "";
		}

		function hideConfigurationScreen (showArticles){
			el.setAttribute('data-visible', 'false');
			if(showArticles){
				headlinesContainer.setAttribute('data-visible', 'true');
			}
		}

		function setAngle(angle){
			angleValue = angle | 0;
			document.body.style.transform = 'rotateX(' + angle + "deg)";
		}

		function setScale(value){
			scaleValue = value | 0;
			headlinesContainer.querySelector('ol').style.transform = "scale(" + value + ")";
		}

		// bind events

		window.addEventListener('touchmove', function (e){
			e.preventDefault();
		}, true);

		sliderHolder.addEventListener('touchmove', function (e){
			const Y = e.touches[0].clientY | 0;
			const mappedY = (Y / window.innerHeight) * 100;
			const minAngle = -90;
			const maxAngle = 90;
			const angleRange = (maxAngle - minAngle);
			
			angleValue = (mappedY / 100) * angleRange + minAngle;
			
			if(mappedY > 0 && mappedY < 100){
				slider.style.transform = 'translateY(' + (Y - (slider.offsetHeight / 2)) + 'px)';
				rotatable.style.transform = 'rotateX(' + angleValue + 'deg)';
			}

		}, false);

		saveBtn.addEventListener('click', function (){

			localStorage.setItem('dash-config', JSON.stringify( { angle : angleValue } ) );
			hideConfigurationScreen(true);
			setAngle(angleValue);

		}, false);

		let twoStart = 0;

		window.addEventListener('touchstart', function (e){

			if(e.touches.length > 2){
				localStorage.clear();
				showConfigurationScreen();
				headlinesContainer.setAttribute('data-visible', 'false');
			}

			/*if(e.touches.length === 2){

				Array.from(e.touches).forEach(touch => {
					twoStart += touch.clientY;
				});

				twoStart = twoStart / e.touches.length;

			}*/

		}, false);


		window.addEventListener('touchmove', function (e){
			// We're going to do the whole zooming thing here
			if(e.touches.length === 2){

				let twoPosition = 0;

				Array.from(e.touches).forEach(touch => {

					twoPosition += touch.clientY;

				});

				twoPosition = twoPosition / e.touches.length;

				const minValue = 1.5;
				const maxValue = 0.5;
				const valueRange = (maxValue - minValue);
				
				scaleValue = (twoPosition / window.innerHeight) * valueRange + minValue;
				headlinesContainer.querySelector('ol').style.transform = "scale(" + scaleValue + ")";

			}

		}, false);

		window.addEventListener('touchend', function (e){

			if(e.touches.length === 0){
				let storedVariables = JSON.parse(localStorage.getItem('dash-config'));
				storedVariables.scale = scaleValue;

				localStorage.setItem('dash-config', JSON.stringify(storedVariables));

			}

		}, false);

		return {
			show : showConfigurationScreen,
			hide : hideConfigurationScreen,
			setAngle : setAngle,
			setScale : setScale
		};

	}());

	function populateWithStories (stories){

		return new Promise(function(resolve, reject){

			const articlesFrag = document.createDocumentFragment();
			const storyContainer = document.createElement('ol');

			stories.forEach(story => {

				const li = document.createElement('li');
				const h1 = document.createElement('h1');
				const p = document.createElement('p');

				h1.textContent = story.headline;
				p.textContent = story.subheading;

				li.appendChild(h1);
				li.appendChild(p);

				storyContainer.appendChild(li);

			});

			articlesFrag.appendChild(storyContainer);

			headlinesContainer.innerHTML = "";
			headlinesContainer.appendChild(articlesFrag);

			resolve();

		});

	}

	function initialise (){

		if(storedConfiguration === null){

			configuration.show();

		} else {
			configuration.hide();
			configuration.setAngle(storedConfiguration.angle);
			headlinesContainer.setAttribute('data-visible', 'true');
		}
	
		getTopStories(0, 3)
			.then(stories => populateWithStories(stories)).
			then(function(){
				configuration.setScale(storedConfiguration.scale);
			});
		;
		
	}

	return {
		init : initialise
	};

}());


$(function () {

	__dash.init();

});
