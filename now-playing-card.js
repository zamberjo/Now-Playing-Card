class NowPlayingPoster extends HTMLElement {

  set hass(hass) {
    if (!this.content) {
      const card = document.createElement('ha-card');
      this.content = document.createElement('div');
      card.appendChild(this.content);
	    card.style = "background: none;";
      this.appendChild(card);
    }

    const offposter = this.config.off_image;
    const entityId = this.config.entity;
    const state = hass.states[entityId];
    const stateStr = state ? state.state : 'unavailable';
    const img = document.createElement('img');
    img.width = "100%";
    img.height = "100%";

    if (state) {
      const movposter = state.attributes.entity_picture;
      if (["playing", "on"].indexOf(stateStr) > -1 ) {
        if ( ! movposter ) {
          if ( offposter ) {
            img.src = offposter;
          }
        } else {
          img.src = movposter;
        }
      } else  if ( offposter ) {
        img.src = offposter;
      }
    }
    if ( img.src ) {
      this.content.innerHTML = img;
    }
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error('You need to define an entity');
    }
    this.config = config;
  }

  // The height of your card. Home Assistant uses this to automatically
  // distribute all cards over the available columns.
  getCardSize() {
    return 3;
  }
}

customElements.define('now-playing-poster', NowPlayingPoster);
