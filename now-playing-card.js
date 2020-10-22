import {
	LitElement, html
  } from 'https://unpkg.com/@polymer/lit-element@^0.5.2/lit-element.js?module';
  
  class NowPlayingPoster extends LitElement {
	static get properties() {
	  return {
		hass: Object,
		config: Object,
		state: Object,
		updateNumber: Number,
	  }
	}
  
	constructor() {
	  console.debug("[constructor] ->", arguments);
	  super(...arguments);
	  this.updateNumber = false;
	  console.debug("[constructor] <-");
	}
  
	firstUpdated() {
	  console.debug("[firstUpdated] ->", arguments);
	  super.firstUpdated(arguments);
	  console.debug("[firstUpdated] <-");
	}
  
	// ready() {
	//   console.debug("[ready] ->", arguments);
	//   super.ready();
	//   console.debug("[ready] <-");
	// }
  
	_render() {
	  console.debug("[_render] <-", arguments);
	  let outerHTML;
	  if ( this.isAvailable ) {
		if ( ! this.isOn && ! this.srcImg ) {
		  outerHTML = html`<!-- Tv is off :( -->`;
		} else {
		  let actionStyle = html``;
		  if ( this.holdAction || this.clickAction ) {
			actionStyle = html``;
		  }
		  outerHTML = html`
			<style>
			  .npp-container {
				background-color: none;
				text-align: center;
			  }
			  .npp-container img {
				width: 100%;
				border-radius: 5px;
				border: 1px solid black;
			  }
			  ${actionStyle}
			</style>
			<div class="npp-container" id="container">
			  <img id="npp-img" src="${this.srcImg}" alt="${this.altImg}"/>
			</div>
		  `;
		}
	  } else {
		outerHTML = html`<!-- Tv is unavailable :S -->`;
	  }
	  console.debug("[_render] ->", { outerHTML });
	  return outerHTML;
	}
  
	_createRoot() {
	  console.debug("[_createRoot] <-");
	  const self = this;
	  const shadow = this.attachShadow({ mode: 'open' })
	  const card = document.createElement('npp-card');
	  const holdTime = 3000;
	  var timeoutId = 0;
	  var holdAction = false;
	  if ( !this.config.show_card ) {
		return shadow;
	  }
	  card.addEventListener('click', function() {
		if ( !holdAction ) {
		  self._click();
		}
	  });
	  card.addEventListener('mousedown', function() {
		console.debug('mousedown!!');
		timeoutId = setTimeout(
		  function () {
			holdAction = true;
			self._hold();
		  }, holdTime
		);
	  });
	  card.addEventListener('mouseup', function() {
		console.debug('mouseup!!');
		clearTimeout(timeoutId);
		holdAction = false;
	  });
	
	  shadow.appendChild(card);
	  console.debug("[_createRoot] ->", card);
	  return card;
	}
  
	_click() {
	  console.debug("[_click] <-");
	  this._fire(this.tapAction, { entityId: this.config.entity });
	  console.debug("[_click] ->");
	}
  
	_hold() {
	  console.debug("[_hold] <-");
	  this._fire(this.holdAction, { entityId: this.config.entity });
	  console.debug("[_hold] ->");
	}
  
	// _firstRendered() {
	//   return this._render(this);
	// }
  
	_didRender() {
	  console.debug("[_didRender] <-");
	  this.nppImg = this._root.querySelector('#npp-img');
	  // if ( this.config ) {
	  //   this._updateConfig();
	  // }
	  console.debug("[_didRender] ->");
	  return this._render(this.config);
	}
  
	setConfig(config) {
	  const self = this;
	  console.debug("[setConfig] <-", arguments);
	  if ( !config.entity ) {
		throw new Error('You need to define an entity');
	  }
	  this.config = config;
	  // if ( this.nppImg ) {
	  //   this._updateConfig();
	  // }
	  setTimeout(function () {
		console.debug("Force attr change!");
		self.updateNumber = true;
	  }, 5000);
	  console.debug("[setConfig] ->");
	}
  
	getCardSize() {
	  return 3;
	}
  
	// _updateConfig() {
	//   const container = this._root.querySelector('.labelContainer');
	//   container.style.color = 'var(--primary-text-color)';
  
	//   if (this.config.font_style) {
	//     Object.keys(this.config.font_style).forEach((prop) => {
	//       container.style.setProperty(prop, this.config.font_style[prop]);
	//     });
	//   }
	// }
  
	set hass(hass) {
	  console.debug("[hass] <-", arguments);
	  this.state = hass.states[this.config.entity];
	  const offposter = this.config.off_image;
  
	  this.srcImg = false;
	  this.altImg = '';
	  this.isAvailable = false;
	  this.isOn = false;
	  this.tapAction = this.config.tap_action;
	  this.holdAction = this.config.hold_action;
  
	  console.debug("this.state", this.state);
	  if ( this.state && this.state.attributes ) {
		this.isAvailable = true;
		const stateStr = this.state.state;
		const movposter = this.state.attributes.entity_picture;
  
		if (["playing", "on"].indexOf(stateStr) > -1 ) {
		  if ( ! movposter ) {
			if ( offposter ) {
			  this.srcImg = offposter;
			  this.altImg = "Tv Playing! But = dont't know what :\\";
			}
		  } else {
			this.srcImg = movposter;
			this.altImg = "Tv Playing!";
		  }
		} else {
		  if ( offposter ) {
			this.srcImg = offposter;
			this.altImg = "Tv Off..zzz..";
		  }
		}
	  }
	  this.tapAction = this._normalizeAction(this.tapAction);
	  this.holdAction = this._normalizeAction(this.holdAction);
	  console.debug("[hass] ->");
	}
  
	_normalizeAction(action) {
	  let normalizedAction;
	  switch((action || {}).action) {
		case "more-info":
		  normalizedAction = "hass-more-info";
		  break;
		case "toggle":
		  normalizedAction = "hass-toggle";
		  break;
		case "call-service":
		  normalizedAction = "hass-call-service";
		  break;
		case "navigate":
		  normalizedAction = "hass-navigate";
		  break;
		case "url":
		  normalizedAction = "hass-url";
		  break;
		default:
		  normalizedAction = false;
		  break;
	  }
	  return normalizedAction;
	} 
  
	_fire(type, detail) {
	  console.debug("[_click] <-", arguments);
	  const event = new Event(type, {
		bubbles: true,
		cancelable: false,
		composed: true
	  });
	  event.detail = detail || {};
	  this.shadowRoot.dispatchEvent(event);
	  console.debug("[_click] ->", {event});
	  return event;
	}
  }
  
  customElements.define('now-playing-poster', NowPlayingPoster);