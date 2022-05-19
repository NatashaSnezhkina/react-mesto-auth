import React, { useEffect, useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import Header from './Header';
import Main from './Main';
import Footer from './Footer';
import ImagePopup from './ImagePopup';
import EditProfilePopup from '../components/EditProfilePopup';
import EditAvatarPopup from '../components/EditAvatarPopup';
import AddPlacePopup from './AddPlacePopup';
import ConfirmPopup from './ConfirmPopup';
import api from '../utils/api';
import { CurrentUserContext } from '../contexts/CurrentUserContext';
import { CardsContext } from '../contexts/CardsContext';
import Register from './Register';
import Login from './Login';
import InfoTooltip from './InfoTooltip';
import ProtectedRoute from './ProtectedRoute';
import * as Auth from '../utils/Auth';

function App() {

  const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = useState(false);
  const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = useState(false);
  const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = useState(false);
  const [isConfirmPopupOpen, setIsConfirmPopupOpen] = useState(false);
  const [isInfoTooltipOpen, setIsInfoTooltipOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState({ name: "", link: "" });
  const [card, setCard] = useState({ name: "", link: "", _id: "" });
  const [currentUser, setCurrentUser] = useState({});
  const [cards, setCards] = useState([]);
  const [loggedInn, setLoggedInn] = useState(false);
  const [email, setEmail] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("jwt");

  useEffect(() => {
    if (loggedInn === true) {
      api.getProfileInfo(token)
        .then((currentUser) => {
          setCurrentUser(currentUser);
          console.log(currentUser);
          console.log(token);
        })
        .catch(err => {
          console.log(err);
        })
    }

  }, [loggedInn, token])

  useEffect(() => {
    if (loggedInn === true) {
      api.getCards(token)
      .then((res) => {
        setCards(
          res
        )
      })
      .catch(err => {
        console.log(err);
      })
    }
  }, [loggedInn, token])

  useEffect(() => {
    if (token) {
      return Auth.getContent(token)
        .then((res) => {
          console.log(res);
          setLoggedInn(true);
          setEmail(res.email);
          setCurrentUser(res);
          navigate('/');
        })
        .catch((err) => {
          setIsSuccess(false);
          if (err.status === 401) {
            console.log('401 — Токен не передан или передан не в том формате');
          }
          console.log(token, '401 — Переданный токен некорректен');
        })
    }
  }, [navigate.location, token]);

  // actions with cards

  function handleAddPlace(card) {
    api.sendCard(card, token)
      .then((newCard) => {
        setCards(
          [newCard, ...cards]
        )
        closeAllPopups();
      }
      )
      .catch(err => {
        console.log(`Ошибка связанная с загрузкой новой карточки: ${err}`);
      })
  }

  function handleEditAvatarClick() {
    setIsEditAvatarPopupOpen(true);
  }

  function handleEditProfileClick() {
    setIsEditProfilePopupOpen(true);
  }

  function handleAddClick() {
    setIsAddPlacePopupOpen(true);
  }

  function handleCardClick(data) {
    setSelectedCard({ name: data.name, link: data.link });
  }

  function handleCardDeleteClick(data) {
    setIsConfirmPopupOpen(true);
    setCard(data);
  }

  function closeAllPopups() {
    setIsEditAvatarPopupOpen(false);
    setIsEditProfilePopupOpen(false);
    setIsAddPlacePopupOpen(false);
    setSelectedCard({ name: "", link: "" });
    setIsConfirmPopupOpen(false);
    setIsInfoTooltipOpen(false);
  }

  // user

  function handleUpdateUser(currentUser) {
    api.sendProfileInfo(currentUser, token)
      .then((user) => {
        setCurrentUser(user);
        setIsEditProfilePopupOpen(false);
      })
      .catch(err => {
        console.log(err)
      })
  }

  function handleUpdateAvatar(currentUser) {
    api.sendAvatar(currentUser, token)
      .then((res) => {
        setCurrentUser(res);
        setIsEditAvatarPopupOpen(false);
      })
      .catch(err => {
        console.log(err);
      })
  }

  // from endpoin

  function handleCardLike(card) {
    const isLiked = card.likes.some(i => i === currentUser._id);

    api.changeLikeCardStatus(card._id, !isLiked, token)
      .then((newCard) => {
        console.log(newCard);
        setCards((state) => 
        state.map((c) => c._id === card._id ? newCard : c));
      })
      .catch(err => {
        console.log(`Ошибка при размещении лайка${err}`);
      });
  }

  function handleCardDelete(card) {
    api.deleteCard(card._id, token)
      .then(() => {
        setCards((cards) => cards.filter((c) => {
          return c._id !== card._id;
        }));
        closeAllPopups();
      })
      .catch(err => {
        console.log(`Ошибка при удалении карточки: ${err}`);
      })
  }

  // sign-in/-up/-out

  function handleLogin(email, password) {
    Auth.authorize(email, password)
      .then((data) => {
        Auth.getContent(data.token).then((res) => {
          // localStorage.setItem('jwt', res.token);
          setLoggedInn(true);
          setEmail(email);
          navigate('/');
        });
      })
      .catch((err) => {
        setIsSuccess(false);
        setIsInfoTooltipOpen(true);
        if (err.status === 400) {
          console.log('400 - не передано одно из полей');
        } else if (err.status === 401) {
          console.log('401 - пользователь с email не найден');
        }
      });
  }

  function handleRegister(email, password) {
    return Auth.register(email, password)
      .then(() => {
        setIsSuccess(true);
        navigate('/sign-in');
      })
      .catch((err) => {
        setIsSuccess(false);
        if (err.status === 400) {
          console.log('400 - некорректно заполнено одно из полей');
        }
      })
      .finally(() => {
        setIsInfoTooltipOpen(true);
      })
  }

  function signOut() {
    localStorage.removeItem('jwt');
    setLoggedInn(false);
    navigate('/login');
  }

  return (
    <CurrentUserContext.Provider value={currentUser}>
      <CardsContext.Provider value={cards}>
        <div className="App">
          <div className="root">
            <Header
              email={email}
              signOut={signOut}
            />
            <Routes>
              <Route exact path="/"
                element={
                  <ProtectedRoute loggedIn={loggedInn}>
                    <Main
                      onEditProfile={handleEditProfileClick}
                      onAddPlace={handleAddClick}
                      onEditAvatar={handleEditAvatarClick}
                      onCardClick={handleCardClick}
                      cards={cards}
                      onCardLike={handleCardLike}
                      onCardDelete={handleCardDeleteClick} />
                  </ProtectedRoute>
                } />

              <Route path="/sign-up" element={<Register handleRegister={handleRegister} />} />
              <Route path="/sign-in" element={<Login handleLogin={handleLogin} />} />

            </Routes>

            <Footer />

            <EditProfilePopup
              isOpen={isEditProfilePopupOpen}
              onClose={closeAllPopups}
              onUpdateUser={handleUpdateUser}
            />

            <EditAvatarPopup
              isOpen={isEditAvatarPopupOpen}
              onClose={closeAllPopups}
              onUpdateAvatar={handleUpdateAvatar}
            />

            <AddPlacePopup
              isOpen={isAddPlacePopupOpen}
              onClose={closeAllPopups}
              onAddPlace={handleAddPlace}
            />

            <ConfirmPopup
              isOpen={isConfirmPopupOpen}
              onClose={closeAllPopups}
              onSubmit={handleCardDelete}
              card={card}
            />

            <ImagePopup
              card={selectedCard}
              onClose={closeAllPopups}
            ></ImagePopup>

            <InfoTooltip
              isOpen={isInfoTooltipOpen}
              onClose={closeAllPopups}
              isSuccess={isSuccess} />

          </div>
        </div>
      </CardsContext.Provider>
    </CurrentUserContext.Provider >
  );
}

export default App
