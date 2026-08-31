let me_data;
let game_data;
let studio_data;
let all_games;
let games_active = []
let games_number = []
let certain_game_data;
let active_ccu = 0;
let config;

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

console.log("test")

async function get_user_data() {
    const response = await fetch("https://playvortex.io/me");
    me_data = await response.json();
}

/*async function get_game_data() {
  const response = await fetch("https://playvortex.io/api/game-stats");
  game_data = await response.json();
}*/
async function get_game_data() {
  console.log("GAME DATA: starting");

  const response = await fetch("https://playvortex.io/api/game-stats");

  console.log("GAME DATA: response received", response.status);

  game_data = await response.json();

  //console.log("GAME DATA: JSON received");
}


async function get_studio_data() {
  const response = await fetch("https://playvortex.io/api/studio-stats");
  studio_data = await response.json();
}

async function get_all_games() {
  const response = await fetch("https://playvortex.io/api/games");
  all_games = await response.json();
}

async function get_certain_game_data(game_id) {
  const response = await fetch(`https://playvortex.io/api/games/${game_id}`);
  certain_game_data = await response.json();
}

const formatNumber = (num) =>
  new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(num);

async function navbar() {

  //console.log("TEST SWITCH")

  if (config.profile_username == true) {
    const navbar = document.querySelector(".navbar");
    let username

    if (window.location.pathname === "/home") {
      const greeting_username = document.querySelector("#home-greeting").textContent.split(", ")[1].slice(0, -1)
      username = greeting_username
    } else {
      await get_user_data()
      username = me_data.username
    }

    console.log(username)

    let margin_right = 0;

    username.split("").forEach(() => {
      margin_right += 11
    })
    // each letter adds 11 pixels to the margin to make sure every username is spaced correctly

    document.querySelector("#my-profile-btn").style.marginRight = `${margin_right}px`

    const usertext = document.createElement("a");
    usertext.style.fontSize = "1.2rem";
    usertext.style.fontWeight = "bold";
    usertext.style.textDecoration = "none";
    usertext.style.padding = 0;
    usertext.style.margin = 0;
    usertext.style.position = "absolute";
    usertext.style.color = "white";
    usertext.style.right = "30px";
    usertext.id = "nav-profile-text"
    usertext.textContent = username;

    usertext.href = document.querySelector("#my-profile-btn").href;
    navbar.append(usertext);

    //vortex+ vortex_plus_logo

    if (config.vortex_plus_logo == true) {
      document.querySelector(".navbar-logo-img").src = browser.runtime.getURL("images/vortexpluslogo.png")
    }
  }

}


async function main() {

  if (window.location.pathname === "/home") {

    // rule of thumb here: do the things that dont require a network request first

    // friends

    const page = document.querySelector(".page")
    const friends_section = document.querySelector('#friends-section');

    page.insertBefore(friends_section, page.children[1]);

    // random greeting

    const username = document
            .querySelector("#home-greeting")
            .textContent
            .split(" ")[1]
            .slice(0, -1);

        const greetings = ["Hello", "Hey", "Whats up", "Hows it going"];
        const random_greeting =
            greetings[Math.floor(Math.random() * greetings.length)];

        const full_greeting = `${random_greeting}, ${username}!`;

    document.querySelector("#home-greeting").textContent = full_greeting;

      // add visits

      await get_game_data()

      const game_links = document.querySelectorAll("#games-grid a");

      game_links.forEach(element => {
        const href = element.getAttribute("href");
        const game_number = href.split("/").pop();

        const visits_full = game_data[game_number].visits

        const visits = String(formatNumber(visits_full))

        // so fun fact, now that we are in each game, we can actually see the amount of active ccu by adding everything up.
        // and it doesnt require another request!

        const active_players = Number(game_data[game_number].active)
        active_ccu += active_players

        games_active.push(active_players)
        games_number.push(game_number)


        const visits_template_span = document.createElement("span")
        visits_template_span.classList.add("game-stat-value")
        visits_template_span.style.fontSize = "0.75rem"
        visits_template_span.style.color = "#8a8a9c"

        const visits_template_i = document.createElement("i")
        visits_template_i.classList.add("fa-solid")
        visits_template_i.classList.add("fa-eye")
        visits_template_i.style.fontSize = "0.75rem"

        visits_template_span.append(visits_template_i, document.createTextNode(String(visits)))

        element.querySelector(".game-card-meta").append(visits_template_span)
      });

    await get_studio_data();
    active_ccu += studio_data.active

    console.log(`active ccu: ${active_ccu}`)

    // stats

    await get_all_games() // another request but this one is necessary to see what the game name is

    const game_biggest_ccu = Math.max(...games_active)
    const game_biggest_ccu_id = games_number[games_active.indexOf(game_biggest_ccu)]
    let game_biggest_ccu_name;

    all_games.forEach(game => {
      if (game.id == game_biggest_ccu_id) {
        console.log("game id:", game.id)
        console.log("game name:", game.name)
        game_biggest_ccu_name = game.name
      }
    })

    const home_intro_body = document.querySelector(".home-intro-body")

    const most_popular_game_link = document.createElement("a");

    most_popular_game_link.classList.add("btn-play")
    most_popular_game_link.style.width = "90px"
    most_popular_game_link.href = `/games/${game_biggest_ccu_id}/play`
    most_popular_game_link.textContent = "Play"

    const active_ccu_element = document.createElement("h3");
    const active_ccu_i = document.createElement("i");

    active_ccu_i.classList.add("fa-solid")
    active_ccu_i.classList.add("fa-users")
    active_ccu_i.style.display = "inline"

    active_ccu_element.style.marginBottom = "15px"
    active_ccu_element.style.fontWeight = "normal"

    const most_popular_game_element = document.createElement("h3")
    const most_popular_game_i = document.createElement("i")

    most_popular_game_element.style.fontWeight = "normal"

    most_popular_game_i.classList.add("fa-solid")
    most_popular_game_i.classList.add("fa-users")

    most_popular_game_element.append(document.createTextNode(`Most popular game: ${game_biggest_ccu_name} with `), most_popular_game_i, document.createTextNode(` ${game_biggest_ccu}`))

    active_ccu_element.append(document.createTextNode("Active CCU: "), active_ccu_i, document.createTextNode(` ${active_ccu}`))

    home_intro_body.append(active_ccu_element)
    home_intro_body.append(most_popular_game_element)
    home_intro_body.append(most_popular_game_link)


      // player icons (offline, online, in-game)

    //await get_friends_data()
    // so we can actually use yet another trick, the text actually gets the player data so we
    // read the text and then delete it, so we dont need to make another request

    const friends_links = document.querySelectorAll("#friends-row a");

    friends_links.forEach(element => {
      /*const href = element.getAttribute("href");
      console.log("href: ", href)
      const game_number = href.split("/")[2]
      console.log("game number: ", game_number)*/

      const status_txt = element.querySelector(".friend-status").textContent
      let status
      let offline = false

      if (status_txt == "In Game") {
        status = "in-game"
      } else if (status_txt == "Online") {
        status = "online"
      } else if (status_txt == "In Studio") {
        status = "in-studio"
      } else if (status_txt == "Offline") {
        status = "offline"
        // custom
        offline = true

        const status_icon_span = document.createElement("span");

        status_icon_span.classList.add("status-dot")
        status_icon_span.classList.add("in-game")
        status_icon_span.style.position = "relative"
        status_icon_span.style.bottom = "53px"
        status_icon_span.style.right = "-52px"
        status_icon_span.style.width = "12px"
        status_icon_span.style.height = "12px"
        status_icon_span.style.background = "#5D5D5D"

        element.append(status_icon_span)
      }

        if (offline == false) {

          const status_icon_span = document.createElement("span");

          status_icon_span.classList.add("status-dot")
          status_icon_span.classList.add("in")
          status_icon_span.style.position = "relative"
          status_icon_span.style.bottom = "53px"
          status_icon_span.style.right = "-52px"
          status_icon_span.style.width = "12px"
          status_icon_span.style.height = "12px"

          element.append(status_icon_span)
        }


    });

  }
}

async function games_page() {
  if (window.location.pathname.startsWith("/games/")) {
    const gameid = window.location.pathname.split("/")[2];

    await get_certain_game_data(gameid)

    let i = 0
    let s = 0

    await wait(1000)

    const avatarElements = Array.from(document.querySelectorAll(".server-avatar-grid"));

    certain_game_data.instances.forEach(server => {
      const current_server = avatarElements[s].children
      server.user_ids.forEach(profile_pfp => {
        if (i == 5) { return }

        const profile_element = current_server[i]

        const link_element = document.createElement('a');
        link_element.className = `link-${i}`;
        link_element.href = `/users/${profile_pfp}/profile`

        profile_element.parentNode.insertBefore(link_element, profile_element);
        link_element.appendChild(profile_element);
        i += 1
      })
      s++
      i = 0
    })
  }
}

async function volts_page() {

  if (window.location.pathname === "/volts" && config.theme == "6") {
    console.log("wsg")
    document.querySelectorAll(".volts-card").forEach((element) => { element.children[0].style.filter = "saturate(0)" })
  }

  /*
  await get_user_data()
  if (window.location.pathname.startsWith("/users/")) {
    if (Number(window.location.pathname.split("/")[2]) == me_data.id) {
      const edit_icon_template = document.createElement("template")
      const edit_icon = edit_icon_template.content.firstElementChild

      const waitForButton = setInterval(() => {
        const button = document.querySelector(".btn-secondary");

        if (button) {
          clearInterval(waitForButton);

          button.style.border = "none"
          button.textContent = ""

          button.append(edit_icon)
        }
      }, 100);
    }
  }*/
}

function commands() {
  const q = new URLSearchParams(window.location.search).get("q");

  if (window.location.pathname === "/search" && q?.startsWith("/volts set ")) {
    const amount = Number(String(window.location).split("+")[2]);
    console.log(amount)

    const success = document.createElement("h1")
    success.textContent = `Vortex command: volts set ${amount} sucessfully ran`

    document.querySelector("#navbar-volts-count").textContent = amount
    alert(success.textContent)
  }
}

function themes(theme) {
  if (theme == "1") { }
  if (theme == "2") {
    document.documentElement.style.setProperty("--background-gradient", "linear-gradient(180deg, hsl(0, 100%, 33.9%) 0%, hsl(354.3, 77.7%, 57.8%) 100%)")
    document.documentElement.style.setProperty("--navbar-bg-gradient", "linear-gradient(to bottom, #c9492c, #911313)")
    document.documentElement.style.setProperty("--navbar-search-bg", "#ab0000")
    document.documentElement.style.setProperty("--navbar-search-icon-color", "#ff8282")
    document.documentElement.style.setProperty("--navbar-search-text-color", "#ffffff")
    document.documentElement.style.setProperty("--play-btn-bg", "red")
    document.documentElement.style.setProperty("--games-bg", "linear-gradient(to bottom, #c9422c, #911313)")
    document.documentElement.style.setProperty("--footer-bg", "#600000")
    document.documentElement.style.setProperty("--bio-box-bg", "#6e0000")
    document.documentElement.style.setProperty("--profile-info-panel-bg", "#6e0000")
    document.documentElement.style.setProperty("--biotext-area-bg", "#800c0c")
    document.documentElement.style.setProperty("--btn-primary-bg", "#ed3a3a")
    document.documentElement.style.setProperty("--btn-primary-bg-hover", "#ba2626")
    document.documentElement.style.setProperty("--game-description-box-bg", "#8f0808")
    document.documentElement.style.setProperty("--server-card-bg", "#520000")
    document.documentElement.style.setProperty("--download-bg", "linear-gradient(180deg, hsl(0, 100%, 16.5%) 0%, hsl(0, 69.6%, 40%) 100%)")
    document.documentElement.style.setProperty("--volts-deg", "100deg")
  }
  if (theme == "3") {
    document.documentElement.style.setProperty("--background-gradient", "linear-gradient(180deg, hsl(19.8, 100%, 33.9%) 0%, hsl(16.9, 77.7%, 57.8%) 100%)")
    document.documentElement.style.setProperty("--navbar-bg-gradient", "linear-gradient(to bottom, #c9512c, #913c13)")
    document.documentElement.style.setProperty("--navbar-search-bg", "#ab3000")
    document.documentElement.style.setProperty("--navbar-search-icon-color", "#ffab82")
    document.documentElement.style.setProperty("--navbar-search-text-color", "#fff")
    document.documentElement.style.setProperty("--play-btn-bg", "orange")
    document.documentElement.style.setProperty("--games-bg", "linear-gradient(to bottom, #c9422c, #913c13)")
    document.documentElement.style.setProperty("--footer-bg", "#602d00")
    document.documentElement.style.setProperty("--bio-box-bg", "#ab3000")
    document.documentElement.style.setProperty("--profile-info-panel-bg", "#ab3000")
    document.documentElement.style.setProperty("--biotext-area-bg", "#80420c")
    document.documentElement.style.setProperty("--btn-primary-bg", "#e36c3e")
    document.documentElement.style.setProperty("--btn-primary-bg-hover", "#da6639")
    document.documentElement.style.setProperty("--game-description-box-bg", "#ab3000")
    document.documentElement.style.setProperty("--server-card-bg", "#7e3f26")
    document.documentElement.style.setProperty("--download-bg", "linear-gradient(180deg, hsl(20, 100%, 16.5%) 0%, hsl(19.9, 69.6%, 40%) 100%)")
    document.documentElement.style.setProperty("--volts-deg", "500deg")
  }
  if (theme == "4") {
    document.documentElement.style.setProperty("--background-gradient", "linear-gradient(180deg, hsl(109.6, 100%, 33.9%) 0%, hsl(149.1, 77.7%, 57.8%) 100%)")
    document.documentElement.style.setProperty("--navbar-bg-gradient", "linear-gradient(to bottom, #89c92c, #13911b)")
    document.documentElement.style.setProperty("--navbar-search-bg", "#00600a")
    document.documentElement.style.setProperty("--navbar-search-icon-color", "#82ff84")
    document.documentElement.style.setProperty("--navbar-search-text-color", "#82ff9b")
    document.documentElement.style.setProperty("--play-btn-bg", "green")
    document.documentElement.style.setProperty("--games-bg", "linear-gradient(to bottom, #82c92c, #1d9113)")
    document.documentElement.style.setProperty("--footer-bg", "#0c6000")
    document.documentElement.style.setProperty("--bio-box-bg", "#036e00")
    document.documentElement.style.setProperty("--profile-info-panel-bg", "#036e00")
    document.documentElement.style.setProperty("--biotext-area-bg", "#0c802e")
    document.documentElement.style.setProperty("--btn-primary-bg", "#5fd434")
    document.documentElement.style.setProperty("--btn-primary-bg-hover", "#46ba26")
    document.documentElement.style.setProperty("--game-description-box-bg", "#036e00")
    document.documentElement.style.setProperty("--server-card-bg", "#0a5200")
    document.documentElement.style.setProperty("--download-bg", "linear-gradient(180deg, hsl(120.7, 100%, 16.5%) 0%, hsl(135.2, 69.6%, 40%) 100%)")
    document.documentElement.style.setProperty("--volts-deg", "200deg")
  }
  if (theme == "5") {
    document.documentElement.style.setProperty("--background-gradient", "linear-gradient(180deg, hsl(306.6, 100%, 33.9%) 0%, hsl(295.3, 77.7%, 57.8%) 100%)")
    document.documentElement.style.setProperty("--navbar-bg-gradient", "linear-gradient(to bottom, #c92c93, #911389)")
    document.documentElement.style.setProperty("--navbar-search-bg", "#880086")
    document.documentElement.style.setProperty("--navbar-search-icon-color", "#ff82c8")
    document.documentElement.style.setProperty("--navbar-search-text-color", "#ff82d4")
    document.documentElement.style.setProperty("--play-btn-bg", "pink")
    document.documentElement.style.setProperty("--games-bg", "linear-gradient(to bottom, #c92c93, #91136c)")
    document.documentElement.style.setProperty("--footer-bg", "#af00a4")
    document.documentElement.style.setProperty("--bio-box-bg", "#970063")
    document.documentElement.style.setProperty("--profile-info-panel-bg", "#970063")
    document.documentElement.style.setProperty("--biotext-area-bg", "#800c5e")
    document.documentElement.style.setProperty("--btn-primary-bg", "#ed3ab8")
    document.documentElement.style.setProperty("--btn-primary-bg-hover", "#c53199")
    document.documentElement.style.setProperty("--game-description-box-bg", "#970063")
    document.documentElement.style.setProperty("--server-card-bg", "#52003d")
    document.documentElement.style.setProperty("--download-bg", "linear-gradient(180deg, hsl(323.6, 100%, 16.5%) 0%, hsl(323.2, 69.6%, 40%) 100%)")
    document.documentElement.style.setProperty("--volts-deg", "400deg")
  }

  if (theme == "6") {
    document.documentElement.style.setProperty("--background-gradient", "linear-gradient(180deg, hsl(0, 0%, 0%) 0%, hsl(0, 0%, 100%) 100%)")
    document.documentElement.style.setProperty("--navbar-bg-gradient", "linear-gradient(to bottom, #000, #fff)")
    document.documentElement.style.setProperty("--navbar-search-bg", "#000")
    document.documentElement.style.setProperty("--navbar-search-icon-color", "#fff")
    document.documentElement.style.setProperty("--navbar-search-text-color", "#fff")
    document.documentElement.style.setProperty("--play-btn-bg", "black")
    document.documentElement.style.setProperty("--games-bg", "linear-gradient(to bottom, #fff, #000)")
    document.documentElement.style.setProperty("--footer-bg", "#000")
    document.documentElement.style.setProperty("--bio-box-bg", "#000")
    document.documentElement.style.setProperty("--profile-info-panel-bg", "#000")
    document.documentElement.style.setProperty("--biotext-area-bg", "#414141")
    document.documentElement.style.setProperty("--btn-primary-bg", "#000")
    document.documentElement.style.setProperty("--btn-primary-bg-hover", "#000")
    document.documentElement.style.setProperty("--game-description-box-bg", "#000")
    document.documentElement.style.setProperty("--server-card-bg", "#232323")
    document.documentElement.style.setProperty("--download-bg", "linear-gradient(180deg, hsl(0, 0%, 26.3%) 0%, hsl(0, 0%, 0%) 100%)")
    document.documentElement.style.setProperty("--volts-deg", "0")

  }
}

async function spoilers() {

  if (config.streamer_mode == true) {

    document.querySelector(".settings-main-panel").style.filter = "opacity(0)"

    if (document.querySelector(".vp-spoiler")) {
      document.querySelectorAll(".vp-spoiler").forEach((element) => {
        element.classList.remove("vp-spoiler")
      })
    }

    // spoilers
    if (window.location.pathname == "/settings/account" || window.location.pathname == "/settings") {
      // hide email preview and date of birth

      document.querySelector("#current-dob-display").classList.add("vp-spoiler")


      document.querySelector("#current-email-display").classList.add("vp-spoiler")

    }
    // INSANELY important -- hide ip
    document.querySelectorAll(".sidebar-tab")[2].classList.add("disabled")

    const sidebartab_i = document.createElement("i")
    sidebartab_i.classList.add("fa-solid")
    sidebartab_i.classList.add("fa-clock-rotate-left");

    document.querySelectorAll(".sidebar-tab")[2].textContent = ''
    document.querySelectorAll(".sidebar-tab")[2].append(sidebartab_i, ` Sessions (Streamer mode)`)


    if (window.location.pathname == "/settings/sessions") {

      document.querySelectorAll(".row-desc").forEach((element) => {

        if (element.textContent == "Devices currently signed in to your account.") {
        } else {

          element.classList.add("vp-spoiler")
        }
      })
    }

    if (window.location.pathname == "/settings/security") {
      function addspoiler() {
        document.querySelector("#twofa-status-icon").classList.add("vp-spoiler")
        document.querySelector("#twofa-status-icon").classList.add("hidden")
        document.querySelector("#twofa-status-icon").classList.remove("disabled")
        document.querySelector("#twofa-status-icon").classList.remove("enabled")
        document.querySelector("#twofa-status-icon").style.width = "18px"
        document.querySelector("#twofa-status-icon").children[0].style.display = 'none'
      }
      addspoiler()

      document.querySelector("#twofa-status-icon").addEventListener("click", () => {
        if (document.querySelector("#twofa-status-icon").classList.contains("hidden")) {
          document.querySelector("#twofa-status-icon").classList.remove("hidden")
          document.querySelector("#twofa-status-icon").classList.add("disabled")
          document.querySelector("#twofa-status-icon").children[0].style.display = "inline"
        } else {
          addspoiler()
        }
      })
    }

    await wait(50);
    document.querySelector(".settings-main-panel").style.filter = "opacity(1)"
  }
}

/*const observer = new MutationObserver(() => {
  setTimeout(() => { document.querySelector(".settings-main-panel").style.filter = "opacity(0)" }, 50)
  spoilers()
  setTimeout(() => { document.querySelector(".settings-main-panel").style.filter = "opacity(1)" }, 50)

});

observer.observe(document, { childList: true, subtree: true });*/


async function init() {
  if (config.mastertoggle == true) {
    spoilers()
    const link = document.createElement("link");
        link.id = "vortex-custom-styles";
        link.rel = "stylesheet";
        link.type = "text/css";
        link.href = browser.runtime.getURL("styles.css");
        document.head.appendChild(link);
    themes(config.theme)
    await navbar();
    await main();
    await games_page();
    await volts_page();

    if (config.streamer_mode) {
      document.querySelectorAll(".sidebar-tab").forEach((element) => {
        element.addEventListener("click", async () => {
          document.querySelector(".settings-main-panel").style.filter = "opacity(0)"
          spoilers()
          await wait(50);
          setTimeout(() => { document.querySelector(".settings-main-panel").style.filter = "opacity(1)" }, 1000);
        })
      })
    }
  }
}

async function loadLocalConfig() {
  const storage = await browser.storage.local.get("userConfig");
  const userOverrides = storage.userConfig || {};

  const defaults = {
    "mastertoggle": true,
    "profile_username": true,
    "vortex_plus_logo": true,
    "streamer_mode": false,
    "theme": "1",
  };

  config = { ...defaults, ...userOverrides };

  console.log("config:", config)
  console.log("profile username:", config.profileusername)
  console.log("profile theme:")

  init()
}

async function initloadLocalConfig() {
  await loadLocalConfig()
}

initloadLocalConfig()
