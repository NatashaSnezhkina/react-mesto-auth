class Api {
  constructor({ address }) {
    this._address = address;
  }

  _responseProcessing() {
    return (res => {
      if (res.ok) {
        return res.json()
      }
      return Promise.reject(`Ошибка ${res.status}`)
    })
  }

  getCards(token) {
    return fetch(`${this._address}/cards`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    })
      .then(this._responseProcessing())
  }

  sendCard(data, token) {
    return fetch(`${this._address}/cards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        name: data.name,
        link: data.link
      })
    })
      .then(this._responseProcessing())
  }

  getProfileInfo(token) {
    return fetch(`${this._address}/users/me`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    })
      .then(this._responseProcessing())
  }

  sendProfileInfo(data, token) {
    console.log(token, data);
    return fetch(`${this._address}/users/me`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        name: data.name,
        about: data.about,
      })
    })
      .then(this._responseProcessing())
  }

  sendAvatar(data, token) {
    return fetch(`${this._address}/users/me/avatar`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        avatar: data.avatar
      })
    })
      .then(this._responseProcessing())
  }

  deleteCard(cardId, token) {
    return fetch(`${this._address}/cards/${cardId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
    })
      .then(this._responseProcessing())
  }

  changeLikeCardStatus(cardId, isLiked, token) {
    return fetch(`${this._address}/cards/${cardId}/likes`, {
      method: isLiked ? 'PUT' : 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
    })
      .then(this._responseProcessing())
  }
}

const api = new Api({
  address: 'https://api.mesto.natasha.snezh.nomoredomains.xyz',
});

export default api;