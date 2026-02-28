
const burger = document.querySelector('.burger');

if (burger) {
  burger.addEventListener('click', () => {
    burger.classList.toggle('active');
  });
}

let allCars = [];
const API = "http://127.0.0.1:5000/api";
let currentChip = 'Все';

// function loadUserCars() {
//   return JSON.parse(localStorage.getItem('userCars') || '[]');
// }
async function loadUserCars() {
  const res = await fetch(`${API}/cars`);
  if (!res.ok) return [];
  return await res.json();
}

// function saveUserCars(cars) {
//   localStorage.setItem('userCars', JSON.stringify(cars));
// }


function parseSom(priceStr) {
  if (!priceStr) return NaN;
  return parseInt(String(priceStr).replace(/\s/g, '').replace('сом', '').trim(), 10);
}

function getSearchFilters() {
  const brandSelect = document.querySelector('select');
  const modelInput = document.querySelector('input[placeholder="Например: Camry"]');
  const yearFromInput = document.querySelector('input[placeholder="2015"]');
  const priceToInput = document.querySelector('input[placeholder="1500000"]');

  return {
    brand: brandSelect ? brandSelect.value : 'Любая',
    model: modelInput ? modelInput.value.toLowerCase().trim() : '',
    yearFrom: yearFromInput ? yearFromInput.value.trim() : '',
    priceTo: priceToInput ? priceToInput.value.trim() : ''
  };
}


function applyAllFilters() {
  const { brand, model, yearFrom, priceTo } = getSearchFilters();

  let filtered = allCars.slice();

  
  if (currentChip === 'Седаны') filtered = filtered.filter(c => c.type === 'car');
  else if (currentChip === 'Кроссоверы') filtered = filtered.filter(c => c.type === 'suv');
  else if (currentChip === 'Электро') filtered = filtered.filter(c => c.type === 'electric');
  else if (currentChip === 'Мотоциклы') filtered = filtered.filter(c => c.type === 'motorcycle');
  else if (currentChip === 'Лодки') filtered = filtered.filter(c => c.type === 'boat');
  else if (currentChip === 'Пикапы') filtered = filtered.filter(c => c.type === 'pickup');

  
  filtered = filtered.filter(car => {
    const cleanPrice = parseSom(car.price);

    const matchBrand = brand === 'Любая' || car.brand === brand;
    const matchModel = !model || String(car.model).toLowerCase().includes(model);
    const matchYear = !yearFrom || car.year >= parseInt(yearFrom, 10);
    const matchPrice = !priceTo || cleanPrice <= parseInt(priceTo, 10);

    return matchBrand && matchModel && matchYear && matchPrice;
  });

  renderCars(filtered);
}


function renderCars(cars) {
  const grid = document.querySelector('.grid');
  if (!grid) return;

  grid.innerHTML = '';

  if (!cars || cars.length === 0) {
    grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;">Ничего не найдено</p>';
    return;
  }

  cars.forEach(car => {
    const card = document.createElement('article');
    card.className = 'card';

    card.innerHTML = `
      <div class="card__media">
        <img src="${car.image}" alt="${car.brand} ${car.model}" width="100%" height="100%">
        ${car.badge ? `<div class="badge">${car.badge}</div>` : ''}
      </div>
      <div class="card__body">
        <div class="card__top">
          <h3 class="card__title">${car.brand} ${car.model}</h3>
          <div class="price">${car.price}</div>
        </div>
        <div class="meta">
          <span>${car.year}</span><span>•</span>
          <span>${car.engine}</span><span>•</span>
          <span>${car.km}</span>
        </div>
        <div class="tags">
          <span class="tag">${car.location}</span>
          <span class="tag">${car.owner}</span>
          <span class="tag">${car.condition}</span>
        </div>
        <div class="card__actions">
  <button class="btn btn--ghost fav-btn" data-id="${car.id}" type="button">В избранное</button>
    <button class="btn btn--primary details-btn" data-id="${car.id}" type="button">Подробнее</button>
  ${car.isUser ? `<button class="btn btn--danger delete-btn" data-id="${car.id}">Удалить</button>` : ''}
</div>
      </div>
    `;

    grid.appendChild(card);
  });
}

(async function initCatalog() {
  try {
    const cars = await fetch('cars.json').then(r => r.json());
    const savedCars = await loadUserCars(); // <-- ВАЖНО await

    const carsWithId = cars.map((car, i) => ({
      ...car,
      id: car.id ?? `json_${i}`
    }));

    // server уже должен хранить id, поэтому тут просто помечаем
    const savedWithId = savedCars.map(car => ({
      ...car,
      isUser: true
    }));

    allCars = [...savedWithId, ...carsWithId];
    allCars = allCars.map((c, i) => ({ ...c, id: c.id ?? `tmp_${i}` }));
    applyAllFilters();
  } catch (e) {
    const grid = document.querySelector('.grid');
    if (grid) grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;">Ошибка загрузки каталога</p>';
  }
})();

const searchBtn = document.querySelector('.search__btn');
if (searchBtn) {
  searchBtn.addEventListener('click', () => {
    applyAllFilters();
  });
}
const chips = document.querySelectorAll('.chip');
if (chips.length) {
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('chip--active'));
      chip.classList.add('chip--active');
      currentChip = chip.textContent.trim();
      applyAllFilters();
    });
  });
}
const addAdBtn = document.querySelector('.add-ad-btn');
const modal = document.getElementById('adModal');
const closeModal = document.getElementById('closeModal');
const submitAd = document.getElementById('submitAd');

if (addAdBtn && modal) {
  addAdBtn.addEventListener('click', () => {
    modal.classList.add('active');
  });
}

if (closeModal && modal) {
  closeModal.addEventListener('click', () => {
    modal.classList.remove('active');
  });
}

if (submitAd) {
  submitAd.addEventListener('click', async(e) => {
   
    const brand = document.getElementById('adBrand')?.value.trim();
    const model = document.getElementById('adModel')?.value.trim();
    const year = parseInt(document.getElementById('adYear')?.value, 10);
    const price = document.getElementById('adPrice')?.value.trim();
    const image = document.getElementById('adImage')?.value.trim();
    const type = document.getElementById('adType')?.value;

    const condition = document.getElementById('adCondition')?.value.trim() || "Отличное";
const kmVal = document.getElementById('adKm').value;
const location = document.getElementById('adLocation')?.value.trim() || "Бишкек";
const engineVal = document.getElementById('adEngine').value;
const owner = document.getElementById('adOwner').value.trim();

const km = kmVal ? `${kmVal} км` : "0 км";
const engine = engineVal ? String(engineVal) : "Не указано";
 

    if (!brand || !model || Number.isNaN(year) || !price || !image) {
  alert('Заполните все поля');
  return;
}

    const newCar = {
  brand,
  model,
  year,
  engine,          
  km,              
  price: price + " сом",
  location,
  owner,
  condition,
  image,
  badge: "Актуально",
  type,
  isUser: true
};

    try {
  const res = await fetch(`${API}/cars`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(newCar)
  });

  if (!res.ok) {
    alert("Ошибка сервера");
    return;
  }

  const createdCar = await res.json();
  allCars.unshift(createdCar);
  applyAllFilters();
  modal.classList.remove('active');
} catch (err) {
  alert("Сервер не запущен (Flask)");
}
  });
 document.addEventListener('click', async (e) => {
  const deleteBtn = e.target.closest('.delete-btn');
  if (!deleteBtn) return;

  const id = deleteBtn.dataset.id;

  // находим машину
  const car = allCars.find(c => String(c.id) === String(id));
  if (!car || !car.isUser) return; // защита: удаляем только свои объявления

  try {
    const res = await fetch(`${API}/cars/${id}`, {
      method: "DELETE"
    });

    if (!res.ok) {
      alert("Ошибка удаления на сервере");
      return;
    }

    // удаляем из интерфейса
    allCars = allCars.filter(c => String(c.id) !== String(id));
    applyAllFilters();

  } catch (error) {
    console.error(error);
    alert("Flask сервер не запущен");
  }
});
}
const detailsModal = document.getElementById('detailsModal');
const detailsContent = document.getElementById('detailsContent');
const closeDetails = document.getElementById('closeDetails');
const detailsFav = document.getElementById('detailsFav');
const detailsCall = document.getElementById('detailsCall');
const detailsWa = document.getElementById('detailsWa');

let openedCarId = null;

function openDetailsById(id) {
  const car = allCars.find(c => String(c.id) === String(id));
  if (!car) return;

  openedCarId = car.id;

  detailsContent.innerHTML = `
   <div class="details_hero">
     <div class="details_img">
        <img src="${car.image}">
     </div>
     <div class="details_info">
       <h3>${car.brand} ${car.model}</h3>
       <div><b>Цена:</b> ${car.price}</div>
       <div><b>Год:</b> ${car.year}</div>
       <div><b>Двигатель:</b> ${car.engine}</div>
       <div><b>Пробег:</b> ${car.km}</div>
       <div><b>Город:</b> ${car.location}</div>
       <div><b>Состояние:</b> ${car.condition}</div>
       <div><b>VIN:</b></div>
       <button class="btn btn--primary contact-btn" type="button">
  Диогностика
</button>
       <button class="btn btn-primary Images-btn" type="button">Фотографии</button>
       
     </div>
  `;

//  #контакты
  const phone = car.phone ? String(car.phone).replace(/\D/g, '') : '';
  if (phone) {
    detailsCall.href = `tel:+${phone}`;
    detailsWa.href = `https://wa.me/${phone}`;
    detailsCall.style.pointerEvents = 'auto';
    detailsWa.style.pointerEvents = 'auto';
    detailsCall.style.opacity = '1';
    detailsWa.style.opacity = '1';
  } else {
    detailsCall.href = '#';
    detailsWa.href = '#';
    detailsCall.style.pointerEvents = 'none';
    detailsWa.style.pointerEvents = 'none';
    detailsCall.style.opacity = '.5';
    detailsWa.style.opacity = '.5';
  }

  detailsModal.classList.add('active');
}

document.addEventListener('click', (e) => {
  const detailsBtn = e.target.closest('.details-btn');
  if (detailsBtn) {
    openDetailsById(detailsBtn.dataset.id);
  }
});

if (closeDetails) {
  closeDetails.addEventListener('click', () => {
    detailsModal.classList.remove('active');
    openedCarId = null;
  });
}
function getFavorites() {
  return new Set(JSON.parse(localStorage.getItem('favorites') || '[]'));
}
function saveFavorites(set) {
  localStorage.setItem('favorites', JSON.stringify([...set]));
}
function toggleFavorite(id) {
  const favs = getFavorites();
  if (favs.has(String(id))) favs.delete(String(id));
  else favs.add(String(id));
  saveFavorites(favs);
  return favs.has(String(id));
}
document.addEventListener('click', (e) => {
  const favBtn = e.target.closest('.fav-btn');
  if (!favBtn) return;

  const isFav = toggleFavorite(favBtn.dataset.id);
  favBtn.textContent = isFav ? 'В избранном' : 'В избранное';
});

if (detailsFav) {
  detailsFav.addEventListener('click', () => {
    if (!openedCarId) return;
    const isFav = toggleFavorite(openedCarId);
    detailsFav.textContent = isFav ? 'В избранном' : 'В избранное';
  });
}
const contactModal = document.getElementById('contactModal');
const contactInfo = document.getElementById('contactInfo');
const closeContact = document.getElementById('closeContact');


document.addEventListener('click', (e) => {
  if (e.target.classList.contains('contact-btn')) {
    if (detailsModal) {
      detailsModal.classList.remove('active');
    }

    contactInfo.textContent = "пока пусто :)";

    if (contactModal) {
      contactModal.classList.add('active');
    }
  }
});


if (closeContact) {
  closeContact.addEventListener('click', () => {
    contactModal.classList.remove('active');
  });
}
const ImagesModal = document.getElementById('ImagesModal');
const ImagesInfo = document.getElementById('ImagesInfo');
const closeImages = document.getElementById('closeImages');

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('Images-btn')) {
    if (detailsModal) {
      detailsModal.classList.remove('active');
    }
    ImagesInfo.textContent = "пока фотографий нет :))";
    if (ImagesModal) {
      ImagesModal.classList.add('active');
    }

  }
});
if (closeImages){
  closeImages.addEventListener('click', () => {
    ImagesModal.classList.remove('active');
  });
}
const authModal = document.getElementById('authModal');
const openAuth = document.getElementById('openAuth');
const closeAuth = document.getElementById('closeAuth');

const tabLogin = document.getElementById('tabLogin');
const tabRegister = document.getElementById('tabRegister');
const authTitle = document.getElementById('authTitle');

const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

const loginMsg = document.getElementById('loginMsg');
const regMsg = document.getElementById('regMsg');

function openModalByEl(modalEl) {
  if (modalEl) modalEl.classList.add('active');
}
function closeModalByEl(modalEl) {
  if (modalEl) modalEl.classList.remove('active');
}

function getUsers() {
  return JSON.parse(localStorage.getItem('users') || '[]');
}
function saveUsers(users) {
  localStorage.setItem('users', JSON.stringify(users));
}
function setCurrentUser(user) {
  localStorage.setItem('currentUser', JSON.stringify(user));
}
function getCurrentUser() {
  return JSON.parse(localStorage.getItem('currentUser') || 'null');
}
function logout() {
  localStorage.removeItem('currentUser');
}
// --- Account Panel ---
const accountMenu = document.getElementById('accountMenu');
const accountName = document.getElementById('accountName');
const accountEmail = document.getElementById('accountEmail');
const accountAvatar = document.getElementById('accountAvatar');
const accountLogout = document.getElementById('accountLogout');

const accountProfile = document.getElementById('accountProfile');
const accountMyAds = document.getElementById('accountMyAds');
const accountFavs = document.getElementById('accountFavs');

function getInitials(nameOrEmail) {
  const s = String(nameOrEmail || '').trim();
  return s ? s[0].toUpperCase() : 'A';
}

function updateAccountUI() {
  const user = getCurrentUser();

  // если не вошёл
  if (!user) {
  if (openAuth) openAuth.textContent = 'Войти';
  if (accountMenu) accountMenu.classList.remove('is-open');
  return;
}

  // если вошёл
  if (openAuth) openAuth.textContent = `${user.name} ▾`;
  if (accountName) accountName.textContent = user.name || 'Пользователь';
  if (accountEmail) accountEmail.textContent = user.email || '';
  if (accountAvatar) accountAvatar.textContent = getInitials(user.name || user.email);
}

// Открыть/закрыть меню по клику на кнопку
if (openAuth) {
  openAuth.addEventListener('click', () => {
    const user = getCurrentUser();

    // если не вошёл — открываем модалку входа
    if (!user) {
      showLogin();
      openModalByEl(authModal);
      return;
    }

    // если вошёл — открываем меню
    if (accountMenu) accountMenu.classList.toggle('is-open');
  });
}

// клик вне меню — закрыть
document.addEventListener('click', (e) => {
  if (!accountMenu || !accountMenu.classList.contains('is-open')) return;

  const wrap = document.getElementById('accountWidget');
  if (wrap && !wrap.contains(e.target)) {
    accountMenu.classList.remove('is-open');
  }
});

// Выйти
if (accountLogout) {
  accountLogout.addEventListener('click', () => {
    logout();
    if (accountMenu) accountMenu.classList.remove('is-open');
    updateAccountUI();
    applyAllFilters(); // на случай если хочешь скрывать "мои объявления"
  });
}

// Заглушки кнопок меню (позже подключим)
if (accountProfile) accountProfile.addEventListener('click', () => alert('Профиль: позже сделаем страницу/модалку'));
if (accountMyAds) accountMyAds.addEventListener('click', () => alert('Мои объявления: позже сделаем фильтр по owner/id'));
if (accountFavs) accountFavs.addEventListener('click', () => alert('Избранное: у тебя уже есть favorites — позже покажем отдельным списком'));

// обновление при старте
updateAccountUI();
function showLogin() {
  authTitle.textContent = 'Вход';
  tabLogin.classList.add('auth__tab--active');
  tabRegister.classList.remove('auth__tab--active');
  loginForm.style.display = 'flex';
  registerForm.style.display = 'none';
  if (loginMsg) loginMsg.textContent = '';
  if (regMsg) regMsg.textContent = '';
}

function showRegister() {
  authTitle.textContent = 'Регистрация';
  tabRegister.classList.add('auth__tab--active');
  tabLogin.classList.remove('auth__tab--active');
  registerForm.style.display = 'flex';
  loginForm.style.display = 'none';
  if (loginMsg) loginMsg.textContent = '';
  if (regMsg) regMsg.textContent = '';
}



if (closeAuth && authModal) {
  closeAuth.addEventListener('click', () => closeModalByEl(authModal));
}

if (authModal) {
  authModal.addEventListener('click', (e) => {
    if (e.target === authModal) closeModalByEl(authModal);
  });
}

if (tabLogin) tabLogin.addEventListener('click', showLogin);
if (tabRegister) tabRegister.addEventListener('click', showRegister);

if (registerForm) {
  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('regName')?.value.trim();
    const email = document.getElementById('regEmail')?.value.trim().toLowerCase();
    const password = document.getElementById('regPassword')?.value;

    if (!name || !email || !password) return;

    const users = getUsers();
    const exists = users.some(u => u.email === email);
    if (exists) {
      regMsg.textContent = 'Этот email уже зарегистрирован';
      return;
    }

    const newUser = { id: Date.now(), name, email, password };
    users.push(newUser);
    saveUsers(users);

    setCurrentUser({ id: newUser.id, name: newUser.name, email: newUser.email });
    regMsg.textContent = 'Аккаунт создан. Вы вошли.';
    closeModalByEl(authModal);

   updateAccountUI();
  });
 
}

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail')?.value.trim().toLowerCase();
    const password = document.getElementById('loginPassword')?.value;

    if (!email || !password) return;

    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
      loginMsg.textContent = 'Неверный email или пароль';
      return;
    }

    setCurrentUser({ id: user.id, name: user.name, email: user.email });
    loginMsg.textContent = 'Успешный вход';
    closeModalByEl(authModal);

    updateAccountUI();

  });
}
// Закрытие по клику на фон
const closeModalOverlay = document.getElementById('closeModalOverlay');
const closeModal2 = document.getElementById('closeModal2');

if (closeModalOverlay && modal) closeModalOverlay.addEventListener('click', () => modal.classList.remove('active'));
if (closeModal2 && modal) closeModal2.addEventListener('click', () => modal.classList.remove('active'));

// Превью картинки
const adImage = document.getElementById('adImage');
const adPreviewImg = document.getElementById('adPreviewImg');
const adPreviewBox = document.getElementById('adPreviewBox');

if (adImage && adPreviewImg && adPreviewBox) {
  adImage.addEventListener('input', () => {
    const url = adImage.value.trim();
    const text = adPreviewBox.querySelector('.ad-preview__text');

    if (!url) {
      adPreviewImg.style.display = 'none';
      if (text) text.style.display = 'block';
      return;
    }

    adPreviewImg.src = url;
    adPreviewImg.style.display = 'block';
    if (text) text.style.display = 'none';
  });
}




  