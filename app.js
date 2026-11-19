
(() => {
  const STORAGE_KEY = "nexora_udhaar_records_v1";

  function getRecords() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  }

  function saveRecords(records) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }

  const content = document.querySelector(".content");
  const messages = document.getElementById("messages");
  const input = document.getElementById("messageInput");
  const welcome = document.getElementById("welcome");

  // Create the records panel
  const panel = document.createElement("section");
  panel.id = "udhaarPanel";
  panel.style.display = "none";
  panel.style.marginBottom = "25px";
  panel.style.padding = "18px";
  panel.style.background = "var(--panel)";
  panel.style.border = "1px solid var(--border)";
  panel.style.borderRadius = "15px";

  const chatArea = document.querySelector(".chat-area");
  content.insertBefore(panel, chatArea);

  function addMessage(text, type) {
    const div = document.createElement("div");
    div.className = "message " + type;
    div.textContent = text;
    messages.appendChild(div);
  }

  function formatMoney(amount) {
    return "₹" + Number(amount).toLocaleString("en-IN");
  }

  function renderRecords() {
    const records = getRecords();

    panel.innerHTML = "";

    const heading = document.createElement("h2");
    heading.textContent = "Udhaar Khata";
    heading.style.marginBottom = "8px";
    panel.appendChild(heading);

    const subtitle = document.createElement("p");
    subtitle.textContent = "Your customer balances";
    subtitle.style.color = "var(--muted)";
    subtitle.style.marginBottom = "18px";
    panel.appendChild(subtitle);

    const total = records.reduce(
      (sum, record) => sum + record.balance, 0
    );

    const totalBox = document.createElement("div");
    totalBox.style.padding = "15px";
    totalBox.style.background = "var(--panel2)";
    totalBox.style.borderRadius = "12px";
    totalBox.style.marginBottom = "18px";

    const totalLabel = document.createElement("p");
    totalLabel.textContent = "Total outstanding";
    totalLabel.style.color = "var(--muted)";

    const totalValue = document.createElement("h2");
    totalValue.textContent = formatMoney(total);

    totalBox.append(totalLabel, totalValue);
    panel.appendChild(totalBox);

    if (records.length === 0) {
      const empty = document.createElement("p");
      empty.textContent = "No customer records yet. Add one using the chat.";
      empty.style.color = "var(--muted)";
      panel.appendChild(empty);
      return;
    }

    records.forEach(record => {
      const card = document.createElement("div");
      card.style.padding = "14px 0";
      card.style.borderBottom = "1px solid var(--border)";

      const name = document.createElement("strong");
      name.textContent = record.name;

      const balance = document.createElement("p");
      balance.textContent = "Balance: " + formatMoney(record.balance);
      balance.style.marginTop = "7px";
      balance.style.color = "var(--muted)";

      const history = document.createElement("p");
      history.textContent = record.entries.length + " transaction(s)";
      history.style.fontSize = "12px";
      history.style.color = "var(--muted)";
      history.style.marginTop = "5px";

      card.append(name, balance, history);
      panel.appendChild(card);
    });
  }

  function processRecord(message) {
    const debtMatch = message.match(
      /^(.*?)\s+ne\s+₹?\s*([\d,]+)\s*(?:udhaar|udhar)\s+(?:liye|liya)$/i
    );

    const paymentMatch = message.match(
      /^(.*?)\s+ne\s+₹?\s*([\d,]+)\s*(?:de\s+diye|de\s+diya|jama\s+kiye|jama\s+karaye)$/i
    );

    if (!debtMatch && !paymentMatch) {
      return "Message samajh nahi aaya. Is tarah likho: Ramesh ne ₹500 udhaar liye.";
    }

    const match = debtMatch || paymentMatch;
    const name = match[1].trim();
    const amount = Number(match[2].replace(/,/g, ""));

    if (!name || !Number.isFinite(amount) || amount <= 0) {
      return "Naam aur valid amount check karke dobara try karo.";
    }

    const records = getRecords();
    let record = records.find(
      item => item.name.toLowerCase() === name.toLowerCase()
    );

    if (!record) {
      record = {
        name,
        balance: 0,
        entries: []
      };
      records.push(record);
    }

    if (debtMatch) {
      record.balance += amount;
      record.entries.push({
        type: "udhaar",
        amount,
        date: new Date().toISOString()
      });

      saveRecords(records);
      renderRecords();

      return name + " ka " + formatMoney(amount) +
        " udhaar record ho gaya. Total balance: " +
        formatMoney(record.balance);
    }

    record.balance -= amount;
    record.entries.push({
      type: "payment",
      amount,
      date: new Date().toISOString()
    });

    saveRecords(records);
    renderRecords();

    return name + " ka " + formatMoney(amount) +
      " payment record ho gaya. Remaining balance: " +
      formatMoney(record.balance);
  }

  // Replace the demo chat response with record processing
  window.sendMessage = function () {
    const message = input.value.trim();
    if (!message) return;

    welcome.style.display = "none";
    addMessage(message, "user");
    input.value = "";

    const response = processRecord(message);

    setTimeout(() => {
      addMessage(response, "bot");
    }, 250);
  };

  // Show the records panel when Udhaar Khata is selected
  window.selectNav = function (element, name) {
    document.querySelectorAll(".nav-item").forEach(item => {
      item.classList.remove("active");
    });

    element.classList.add("active");
    document.getElementById("pageTitle").textContent = name;

    const isUdhaar = name === "Udhaar Khata";
    panel.style.display = isUdhaar ? "block" : "none";

    if (isUdhaar) {
      welcome.style.display = "none";
      renderRecords();
    } else {
      welcome.style.display = messages.children.length ? "none" : "block";
    }

    if (window.innerWidth <= 700) {
      document.getElementById("sidebar").classList.remove("open");
    }
  };

  renderRecords();
})();
                    
