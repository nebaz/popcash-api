const fetch = require('node-fetch');
const REQUEST_URL = 'https://api.popcash.net/';

class PopcashApi {

  constructor(token) {
    this.token = token;
  }

  async getCampaigns() {
    let result = await this.apiRequest('campaigns', 'GET');
    if (!result?.campaigns?.items) {
      return false;
    }
    return result.campaigns.items.map(item => {
      item.id = Number(item.id);
      item.status = this.getStatusById(item.status);
      return item;
    });
  }

  /**
   * @param {int} campaignId
   */
  async campaignPlay(campaignId) {
    if (global.ENVIRONMENT !== 'production') {
      return false;
    }
    let body = {status: 1};
    return await this.apiRequest('campaigns/' + campaignId, 'PUT', body);
  }

  /**
   * @param {int} campaignId
   */
  async campaignStop(campaignId) {
    if (global.ENVIRONMENT !== 'production') {
      return false;
    }
    let body = {status: 3};
    return await this.apiRequest('campaigns/' + campaignId, 'PUT', body);
  }

  getStatusById(statusId) {
    switch (statusId) {
      case 0: return 'Pending';
      case 1: return 'Running';
      case 2: return 'Out of funds';
      case 3: return 'Paused';
      case 4: return 'Blocked';
      case 5: return 'Deleted';
      case 6: return 'Rejected';
      case 7: return 'Out of daily funds';
      case 8: return 'Scheduled Pause';
      case 9: return 'System blocked';
      case 10: return 'Held';
      default: return statusId
    }
  }

  async apiRequest(action, method, body) {
    let result = await fetch(REQUEST_URL + action, {
      method: method,
      headers: {'Content-Type': 'application/json', 'X-Api-Key': this.token},
      body: JSON.stringify(body)
    });
    try {
      result = await result.json();
    } catch (e) {
      console.error(new Date().toLocaleString(), 'api popcash ' + action + ' error:', e.message);
      return false;
    }
    if (result.errors) {
      console.error(new Date().toLocaleString(), 'api popcash ' + action + ' error:', result);
      return false;
    }
    return result;
  }

}

module.exports = PopcashApi;
