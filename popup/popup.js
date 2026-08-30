const ratetext = document.getElementById("rate");
const theme_btn = document.getElementById("theme")
const saverevert = document.getElementById("saverevert")
let config;
let shouldbesaveandrevert_check = false;
let shouldbesaveandrevert_theme = false;

// config - checkboxes
const mastertoggle = document.getElementById("mastertoggle")

const navbar_username = document.getElementById("navbar-username")
const vortex_plus_logo = document.getElementById("vortex-plus-logo")
const streamer_mode = document.getElementById("streamer-mode")

function add_revert_btn() {
  if (document.querySelector("#revert") == null) {
    const revertbtn = document.createElement("button")
    revertbtn.id = "revert"
    revertbtn.textContent = "Revert changes"
    revertbtn.style.marginLeft = "5px"
    saverevert.append(revertbtn)
  }
}

function remove_revert_btn() {

  if (shouldbesaveandrevert_check == false && shouldbesaveandrevert_theme == false) {

    if (document.querySelector("#revert") != null) {
      document.querySelector("#revert").remove()
    }

    if (document.querySelector("#save") != null) {
      document.querySelector("#save").remove()
    }
  }
}

function add_save_btn() {
  if (document.querySelector("#save") == null) {
    const savebtn = document.createElement("button")
    savebtn.id = "save"
    savebtn.textContent = "Save changes"
    saverevert.append(savebtn)
  }
}

function revert_settings(config_b) {
  apply_theme(config_b.theme)
  theme_btn.value = config_b.theme
  add_theme_preview(config_b)

  navbar_username.checked = config_b.profile_username
  mastertoggle.checked = config_b.mastertoggle
  vortex_plus_logo.checked = config_b.vortex_plus_logo
}


async function apply_theme(theme) {
  switch (theme) {
    case "1":
      document.documentElement.style.setProperty("--background-gradient", "linear-gradient(180deg, hsla(260, 100%, 34%, 1) 0%, hsla(238, 78%, 58%, 1) 100%)")
      document.documentElement.style.setProperty("--navbar-search-bg", "#1b0060")
      break;
    case "2":
      document.documentElement.style.setProperty("--background-gradient", "linear-gradient(180deg, hsl(0, 100%, 33.9%) 0%, hsl(354.3, 77.7%, 57.8%) 100%)")
      document.documentElement.style.setProperty("--navbar-search-bg", "#ab0000")
      break;
    case "3":
      document.documentElement.style.setProperty("--background-gradient", "linear-gradient(180deg, hsl(19.8, 100%, 33.9%) 0%, hsl(16.9, 77.7%, 57.8%) 100%)")
      document.documentElement.style.setProperty("--navbar-search-bg", "#ab3000")
      break;
    case "4":
      document.documentElement.style.setProperty("--background-gradient", "linear-gradient(180deg, hsl(109.6, 100%, 33.9%) 0%, hsl(149.1, 77.7%, 57.8%) 100%)")
      document.documentElement.style.setProperty("--navbar-search-bg", "#00600a")
      break;
    case "5":
      document.documentElement.style.setProperty("--background-gradient", "linear-gradient(180deg, hsl(306.6, 100%, 33.9%) 0%, hsl(295.3, 77.7%, 57.8%) 100%)")
      document.documentElement.style.setProperty("--navbar-search-bg", "#880086")
      break;
    case "6":
      document.documentElement.style.setProperty("--background-gradient", "linear-gradient(180deg, hsl(0, 0%, 0%) 0%, hsl(0, 0%, 100%) 100%)")
      document.documentElement.style.setProperty("--navbar-search-bg", "#000")
      break;
  }
}

async function reset_theme(config_a) {
  if (document.querySelector("#preview_a") != null) {
    document.querySelector("#preview_a").remove()
  }

  apply_theme(config_a.theme)
}

  async function reload() {
    const profileusername = document.getElementById("navbar-username").checked
    const theme = document.getElementById("theme").value
    console.log("Theme:",theme)

    const storage = await browser.storage.local.get("userConfig");
    const currentOverrides = storage.userConfig || {};

    currentOverrides.profile_username = profileusername;
    currentOverrides.vortex_plus_logo = vortex_plus_logo.checked;
    currentOverrides.theme = theme;
    currentOverrides.mastertoggle = mastertoggle.checked
    currentOverrides.streamer_mode = streamer_mode.checked
    await browser.storage.local.set({ userConfig: currentOverrides });

    apply_theme(theme)

    browser.tabs.reload()
    window.location.reload()
  }

  // save button
  document.addEventListener("click", (event) => {
    if (event.target.closest("#save")) {
      reload()
    }
  })

function checkbox_change(element, config_d) {
  if (element.checked != config_d[element.className]) {
    shouldbesaveandrevert_check = true
    add_save_btn()
    add_revert_btn()
  } else {
    shouldbesaveandrevert_check = false
    remove_revert_btn()
  }
}

// revert
navbar_username.addEventListener("change", () => { checkbox_change(navbar_username, config)})
vortex_plus_logo.addEventListener("change", () => { checkbox_change(vortex_plus_logo, config) })
mastertoggle.addEventListener("change", () => { checkbox_change(mastertoggle, config) })
streamer_mode.addEventListener("change", () => { checkbox_change(streamer_mode, config )})

//revert button
document.addEventListener("click", (event) => {
  if (event.target.closest("#revert")) {
    revert_settings(config)
  }
})

async function add_theme_preview(config_c) {
  if (document.querySelector("#preview_a") != null) {
    document.querySelector("#preview_a").remove()
  }

  const preview_a = document.createElement("a")
  const preview = document.createElement("img")
  preview_a.href = `../images/theme-previews/${theme.value}.png`
  preview_a.style.width = "300px"
  preview_a.style.height = "auto"
  preview_a.id = "preview_a"
  preview.style.marginTop = "5px"
  preview.style.width = "100%"
  preview.style.height = "auto"
  preview.src = `../images/theme-previews/${theme.value}.png`

  apply_theme(theme.value)

  preview_a.addEventListener("click", (event) => {
    event.preventDefault();
    const fullUrl = browser.runtime.getURL(`images/theme-previews/${theme.value}.png`);
    browser.tabs.create({ url: fullUrl });
  }); // make it so it actually opens the new tab with the image

  console.log("preview:",preview)

  document.body.append(preview_a)
  preview_a.append(preview)

  if (config_c.theme != theme_btn.value) {
    shouldbesaveandrevert_theme = true
    add_save_btn()
    add_revert_btn()
  } else if (config_c.theme == theme_btn.value) {
    shouldbesaveandrevert_theme = false;
    remove_revert_btn()
  }
}

//ratetext.addEventListener("click", () => {window.close()})
theme_btn.addEventListener("change", () => {add_theme_preview(config)})

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

    const theme = document.getElementById("theme")

    navbar_username.checked = config.profile_username

    mastertoggle.checked = config.mastertoggle

    streamer_mode.checked = config.streamer_mode

    theme.value = config.theme
    apply_theme(theme.value)
    add_theme_preview(config)

    if (config.mastertoggle == false) {
      [...document.querySelector(".main-toggles").children].forEach((element) => {
        element.style.display = "none"
      })
    }
  }

loadLocalConfig()
