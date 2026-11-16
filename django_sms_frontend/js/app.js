(function () {
  'use strict';

  const API_BASE_URL = 'https://sms-notification-system.onrender.com/api/sms/';
  const SEND_SMS_URL = `${API_BASE_URL}send/`;
  const HISTORY_URL = `${API_BASE_URL}history/`;
  const MESSAGE_LIMIT = 160;

  const DOM = {
    form: document.getElementById('sms-form'),
    recipientInput: document.getElementById('recipient-phone'),
    messageInput: document.getElementById('message-text'),
    charCounter: document.getElementById('char-counter'),
    sendBtn: document.getElementById('send-sms-btn'),
    btnSpinner: document.getElementById('btn-spinner'),
    btnText: document.querySelector('#send-sms-btn .btn-text'),
    phoneValidationMsg: document.getElementById('phone-validation-msg'),
    messageValidationMsg: document.getElementById('message-validation-msg'),
    alertContainer: document.getElementById('alert-container'),
    statusAlert: document.getElementById('status-alert'),
    alertTitle: document.getElementById('alert-title'),
    alertMessage: document.getElementById('alert-message'),
    alertCloseBtn: document.getElementById('alert-close-btn'),
    historySection: document.getElementById('history-section'),
    historyTableBody: document.getElementById('history-table-body'),
    refreshHistoryBtn: document.getElementById('refresh-history-btn'),
    emptyHistoryNotice: document.getElementById('empty-history'),
    userDropdownContainer: document.querySelector('.user-dropdown-container'),
    userDropdownBtn: document.getElementById('user-dropdown-btn'),
    popoverAbout: document.getElementById('popover-about'),
    popoverConfig: document.getElementById('popover-config'),
    popoverLogout: document.getElementById('popover-logout'),
    sidebar: document.getElementById('sidebar'),
    mobileMenuBtn: document.getElementById('mobile-menu-btn'),
    navHome: document.getElementById('nav-home'),
    navHistory: document.getElementById('nav-history'),
    navAbout: document.getElementById('nav-about'),
    navLogout: document.getElementById('nav-logout'),
    settingsModal: document.getElementById('settings-modal'),
    settingsCloseBtn: document.getElementById('settings-close-btn'),
    settingsDoneBtn: document.getElementById('settings-done-btn'),
    aboutModal: document.getElementById('about-modal'),
    aboutCloseBtn: document.getElementById('about-close-btn'),
    aboutOkBtn: document.getElementById('about-ok-btn'),
    toastContainer: document.getElementById('toast-container')
  };

  let messageHistory = [];
  let isHistoryLoading = false;
  let historyError = '';

  function init() {
    if (!DOM.form || !DOM.recipientInput || !DOM.messageInput ||
        !DOM.charCounter || !DOM.historyTableBody || !DOM.emptyHistoryNotice) {
      console.error('SMS Sender could not initialize because required page elements are missing.');
      return;
    }

    removeLegacyBrowserData();
    setupEventListeners();
    updateCharCounter();
    hideAlert();
    renderHistoryTable();
    fetchSMSHistory();
  }

  function setupEventListeners() {
    bind(DOM.recipientInput, 'input', handlePhoneInput);
    bind(DOM.recipientInput, 'blur', () => validatePhone(DOM.recipientInput.value));
    bind(DOM.messageInput, 'input', handleMessageInput);
    bind(DOM.messageInput, 'blur', () => validateMessage(DOM.messageInput.value));
    bind(DOM.form, 'submit', handleFormSubmit);
    bind(DOM.alertCloseBtn, 'click', hideAlert);
    bind(DOM.refreshHistoryBtn, 'click', handleRefreshHistory);

    bind(DOM.userDropdownBtn, 'click', (event) => {
      event.stopPropagation();
      toggleUserDropdown();
    });

    if (DOM.userDropdownContainer) {
      document.addEventListener('click', (event) => {
        if (!DOM.userDropdownContainer.contains(event.target)) {
          closeUserDropdown();
        }
      });
    }

    bind(DOM.navHome, 'click', () => {
      setActiveNav(DOM.navHome);
      closeMobileMenu();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      DOM.recipientInput.focus();
    });
    bind(DOM.navHistory, 'click', () => {
      setActiveNav(DOM.navHistory);
      closeMobileMenu();
      if (DOM.historySection) {
        DOM.historySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
    bind(DOM.navAbout, 'click', openAboutModal);
    bind(DOM.navLogout, 'click', handleLogout);

    bind(DOM.mobileMenuBtn, 'click', () => {
      if (DOM.sidebar) {
        DOM.sidebar.classList.toggle('mobile-open');
      }
    });

    bind(DOM.popoverConfig, 'click', (event) => {
      event.preventDefault();
      closeUserDropdown();
      openSettingsModal();
    });
    bind(DOM.settingsCloseBtn, 'click', closeSettingsModal);
    bind(DOM.settingsDoneBtn, 'click', closeSettingsModal);
    bind(DOM.popoverAbout, 'click', (event) => {
      event.preventDefault();
      closeUserDropdown();
      openAboutModal();
    });
    bind(DOM.aboutCloseBtn, 'click', closeAboutModal);
    bind(DOM.aboutOkBtn, 'click', closeAboutModal);
    bind(DOM.popoverLogout, 'click', (event) => {
      event.preventDefault();
      closeUserDropdown();
      handleLogout();
    });

    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeSettingsModal();
        closeAboutModal();
        closeUserDropdown();
        closeMobileMenu();
      }
    });

    bind(DOM.settingsModal, 'click', (event) => {
      if (event.target === DOM.settingsModal) {
        closeSettingsModal();
      }
    });
    bind(DOM.aboutModal, 'click', (event) => {
      if (event.target === DOM.aboutModal) {
        closeAboutModal();
      }
    });
  }

  function bind(element, eventName, handler) {
    if (element) {
      element.addEventListener(eventName, handler);
    }
  }

  function handlePhoneInput() {
    clearInputError(DOM.recipientInput, DOM.phoneValidationMsg);
  }

  function normalizePhone(phone) {
    const cleaned = phone.replace(/[\s\-()]/g, '');

    if (/^09\d{9}$/.test(cleaned)) {
      return `+63${cleaned.slice(1)}`;
    }
    if (/^639\d{9}$/.test(cleaned)) {
      return `+${cleaned}`;
    }
    if (/^\+639\d{9}$/.test(cleaned)) {
      return cleaned;
    }
    if (/^\+?[1-9]\d{7,14}$/.test(cleaned)) {
      return cleaned.charAt(0) === '+' ? cleaned : `+${cleaned}`;
    }

    return '';
  }

  function validatePhone(phone) {
    if (!normalizePhone(phone.trim())) {
      showInputError(
        DOM.recipientInput,
        DOM.phoneValidationMsg,
        'Enter a valid phone number, such as +63 912 345 6789 or 09123456789.'
      );
      return false;
    }

    clearInputError(DOM.recipientInput, DOM.phoneValidationMsg);
    return true;
  }

  function handleMessageInput() {
    clearInputError(DOM.messageInput, DOM.messageValidationMsg);
    updateCharCounter();
  }

  function updateCharCounter() {
    const length = DOM.messageInput.value.length;
    DOM.charCounter.textContent = `${length} / ${MESSAGE_LIMIT}`;
    DOM.charCounter.className = length >= MESSAGE_LIMIT
      ? 'char-counter limit'
      : length >= MESSAGE_LIMIT - 20
        ? 'char-counter warning'
        : 'char-counter';
  }

  function validateMessage(message) {
    if (!message.trim()) {
      showInputError(DOM.messageInput, DOM.messageValidationMsg, 'Message text is required.');
      return false;
    }
    if (message.length > MESSAGE_LIMIT) {
      showInputError(
        DOM.messageInput,
        DOM.messageValidationMsg,
        `Message cannot exceed ${MESSAGE_LIMIT} characters.`
      );
      return false;
    }

    clearInputError(DOM.messageInput, DOM.messageValidationMsg);
    return true;
  }

  function showInputError(input, messageElement, message) {
    input.classList.add('is-invalid');
    input.setAttribute('aria-invalid', 'true');
    if (messageElement) {
      messageElement.textContent = message;
      messageElement.style.display = 'block';
    }
  }

  function clearInputError(input, messageElement) {
    input.classList.remove('is-invalid');
    input.setAttribute('aria-invalid', 'false');
    if (messageElement) {
      messageElement.textContent = '';
      messageElement.style.display = 'none';
    }
  }

  async function handleFormSubmit(event) {
    event.preventDefault();

    const phone = DOM.recipientInput.value.trim();
    const message = DOM.messageInput.value;
    const phoneIsValid = validatePhone(phone);
    const messageIsValid = validateMessage(message);

    if (!phoneIsValid || !messageIsValid) {
      return;
    }

    setSubmitting(true);
    hideAlert();

    try {
      const result = await requestJson(SEND_SMS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          recipient: normalizePhone(phone),
          message: message.trim()
        })
      });

      const returnedStatus = result.data && result.data.status;
      const successMessage = returnedStatus
        ? `Django accepted the SMS request. Reported status: ${returnedStatus}.`
        : 'Django accepted the SMS request.';
      showAlert('success', 'SMS request accepted', successMessage);

      DOM.messageInput.value = '';
      updateCharCounter();
      DOM.recipientInput.focus();

      await fetchSMSHistory();
    } catch (error) {
      console.error('SMS send request failed:', error);
      showAlert('error', 'Failed to send message', error.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function requestJson(url, options) {
    let response;
    try {
      response = await fetch(url, options);
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error(`Cannot connect to Django at ${API_BASE_URL}. Check that the backend is running and CORS allows this page.`);
      }
      throw error;
    }

    const responseText = await response.text();
    let result = null;
    if (responseText) {
      try {
        result = JSON.parse(responseText);
      } catch (error) {
        if (response.ok) {
          throw new Error('Django returned an invalid JSON response.');
        }
      }
    }

    if (!response.ok) {
      throw new Error(getApiError(result, response, responseText));
    }
    if (!result || typeof result !== 'object' || Array.isArray(result)) {
      throw new Error('Django returned an unexpected response.');
    }
    if (result.success === false) {
      throw new Error(getApiError(result, response, responseText));
    }

    return result;
  }

  function getApiError(result, response, responseText) {
    if (result && result.message) {
      return result.message;
    }
    if (result && result.detail) {
      return result.detail;
    }

    const errors = result && (result.errors || result);
    if (errors && typeof errors === 'object') {
      const messages = [];
      Object.keys(errors).forEach((key) => {
        const values = Array.isArray(errors[key]) ? errors[key] : [errors[key]];
        values.forEach((value) => {
          if (typeof value === 'string') {
            messages.push(value);
          }
        });
      });
      if (messages.length) {
        return messages.join(' ');
      }
    }

    if (responseText && !result) {
      return `Django returned HTTP ${response.status}: ${responseText}`;
    }
    return `Django returned HTTP ${response.status}${response.statusText ? ` (${response.statusText})` : ''}.`;
  }

  function setSubmitting(isSubmitting) {
    if (DOM.sendBtn) {
      DOM.sendBtn.disabled = isSubmitting;
    }
    DOM.recipientInput.disabled = isSubmitting;
    DOM.messageInput.disabled = isSubmitting;

    if (DOM.btnSpinner) {
      DOM.btnSpinner.style.display = isSubmitting ? 'inline-block' : 'none';
    }
    if (DOM.btnText) {
      DOM.btnText.textContent = isSubmitting ? 'Sending...' : 'Send SMS';
    }
    const icon = DOM.sendBtn && DOM.sendBtn.querySelector('.btn-icon');
    if (icon) {
      icon.style.display = isSubmitting ? 'none' : 'inline-block';
    }
  }

  function showAlert(type, title, message) {
    if (!DOM.statusAlert || !DOM.alertContainer || !DOM.alertTitle || !DOM.alertMessage) {
      return;
    }

    DOM.statusAlert.className = `alert-card alert-${type}`;
    DOM.alertTitle.textContent = title;
    DOM.alertMessage.textContent = message;

    const iconContainer = DOM.statusAlert.querySelector('.alert-icon-container');
    if (iconContainer) {
      const iconColor = type === 'success' ? '#16a34a' : '#dc2626';
      const iconPath = type === 'success'
        ? '<path d="M7.5 12.5L10.5 15.5L16.5 9.5" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>'
        : '<path d="M8 8l8 8M16 8l-8 8" stroke="white" stroke-width="2.2" stroke-linecap="round"/>';
      iconContainer.innerHTML = `<svg class="alert-icon" width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="11" fill="${iconColor}"/>${iconPath}</svg>`;
    }

    DOM.alertContainer.style.display = 'block';
  }

  function hideAlert() {
    if (DOM.alertContainer) {
      DOM.alertContainer.style.display = 'none';
    }
  }

  async function fetchSMSHistory() {
    isHistoryLoading = true;
    historyError = '';
    renderHistoryTable();
    if (DOM.refreshHistoryBtn) {
      DOM.refreshHistoryBtn.disabled = true;
    }

    try {
      const result = await requestJson(HISTORY_URL, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      if (!Array.isArray(result.data)) {
        throw new Error('Django returned an unexpected SMS history format.');
      }

      messageHistory = result.data.map((sms) => ({
        id: sms.id,
        dateTime: sms.created_at ? formatDateTime(new Date(sms.created_at)) : '—',
        recipient: sms.recipient || '',
        message: sms.message || '',
        status: sms.status == null ? 'unknown' : String(sms.status)
      }));
    } catch (error) {
      historyError = error.message || 'Unable to load SMS history from Django.';
      console.error('SMS history request failed:', error);
      showToast(historyError);
    } finally {
      isHistoryLoading = false;
      if (DOM.refreshHistoryBtn) {
        DOM.refreshHistoryBtn.disabled = false;
      }
      renderHistoryTable();
    }
  }

  function renderHistoryTable() {
    if (!DOM.historyTableBody || !DOM.emptyHistoryNotice) {
      return;
    }

    DOM.historyTableBody.replaceChildren();
    messageHistory.forEach((item) => {
      DOM.historyTableBody.appendChild(createHistoryRowElement(item));
    });

    if (messageHistory.length) {
      DOM.emptyHistoryNotice.style.display = 'none';
      return;
    }

    const notice = DOM.emptyHistoryNotice.querySelector('p');
    if (notice) {
      notice.textContent = historyError || (isHistoryLoading
        ? 'Loading SMS history from Django...'
        : 'No SMS records found in the Django database.');
    }
    DOM.emptyHistoryNotice.style.display = 'flex';
    DOM.emptyHistoryNotice.classList.toggle('history-load-error', Boolean(historyError));
  }

  function createHistoryRowElement(item) {
    const row = document.createElement('tr');
    row.className = 'history-row';
    row.setAttribute('data-id', String(item.id));

    appendTextCell(row, 'col-datetime', item.dateTime);
    appendTextCell(row, 'col-recipient', item.recipient);
    appendTextCell(row, 'col-message', item.message, item.message);

    const statusCell = document.createElement('td');
    statusCell.className = 'col-status';
    const badge = document.createElement('span');
    const status = String(item.status || 'unknown');
    badge.className = `badge badge-${getStatusClass(status)}`;

    const dot = document.createElement('span');
    dot.className = 'badge-dot';
    dot.setAttribute('aria-hidden', 'true');
    badge.append(dot, document.createTextNode(status));
    statusCell.appendChild(badge);
    row.appendChild(statusCell);

    return row;
  }

  function appendTextCell(row, className, value, title) {
    const cell = document.createElement('td');
    cell.className = className;
    cell.textContent = value == null ? '' : String(value);
    if (title) {
      cell.title = title;
    }
    row.appendChild(cell);
  }

  function getStatusClass(status) {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'pending';
      case 'dispatched':
        return 'dispatched';
      case 'sent':
        return 'sent';
      case 'delivered':
        return 'delivered';
      case 'failed':
        return 'failed';
      default:
        return 'unknown';
    }
  }

  async function handleRefreshHistory() {
    if (DOM.refreshHistoryBtn) {
      DOM.refreshHistoryBtn.classList.add('refreshing');
    }
    try {
      await fetchSMSHistory();
    } finally {
      if (DOM.refreshHistoryBtn) {
        DOM.refreshHistoryBtn.classList.remove('refreshing');
      }
    }
  }

  function formatDateTime(date) {
    if (Number.isNaN(date.getTime())) {
      return '—';
    }

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;

    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()} • ${String(hours).padStart(2, '0')}:${minutes} ${period}`;
  }

  function showInputError(input, messageElement, message) {
    input.classList.add('is-invalid');
    input.setAttribute('aria-invalid', 'true');
    if (messageElement) {
      messageElement.textContent = message;
      messageElement.style.display = 'block';
    }
  }

  function openSettingsModal() {
    if (DOM.settingsModal) {
      DOM.settingsModal.classList.add('open');
      DOM.settingsModal.setAttribute('aria-hidden', 'false');
    }
  }

  function closeSettingsModal() {
    if (DOM.settingsModal) {
      DOM.settingsModal.classList.remove('open');
      DOM.settingsModal.setAttribute('aria-hidden', 'true');
    }
  }

  function openAboutModal() {
    if (DOM.aboutModal) {
      DOM.aboutModal.classList.add('open');
      DOM.aboutModal.setAttribute('aria-hidden', 'false');
    }
  }

  function closeAboutModal() {
    if (DOM.aboutModal) {
      DOM.aboutModal.classList.remove('open');
      DOM.aboutModal.setAttribute('aria-hidden', 'true');
    }
  }

  function toggleUserDropdown() {
    if (!DOM.userDropdownContainer || !DOM.userDropdownBtn) {
      return;
    }
    DOM.userDropdownContainer.classList.toggle('open');
    DOM.userDropdownBtn.setAttribute(
      'aria-expanded',
      String(DOM.userDropdownContainer.classList.contains('open'))
    );
  }

  function closeUserDropdown() {
    if (DOM.userDropdownContainer) {
      DOM.userDropdownContainer.classList.remove('open');
    }
    if (DOM.userDropdownBtn) {
      DOM.userDropdownBtn.setAttribute('aria-expanded', 'false');
    }
  }

  function closeMobileMenu() {
    if (DOM.sidebar) {
      DOM.sidebar.classList.remove('mobile-open');
    }
  }

  function setActiveNav(navElement) {
    if (!navElement) {
      return;
    }
    document.querySelectorAll('.nav-item').forEach((element) => {
      element.classList.remove('active');
    });
    navElement.classList.add('active');
  }

  function handleLogout() {
    showToast('Sign out is not connected to an authentication service.');
  }

  function showToast(message) {
    if (!DOM.toastContainer) {
      console.warn(message);
      return;
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    DOM.toastContainer.appendChild(toast);

    window.setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(8px)';
      toast.style.transition = 'all 0.25s ease';
      window.setTimeout(() => toast.remove(), 250);
    }, 3500);
  }

  function removeLegacyBrowserData() {
    try {
      localStorage.removeItem('sms_sender_history_v1');
      localStorage.removeItem('sms_sender_config_v1');
    } catch (error) {
      console.warn('Unable to remove old browser-only SMS data:', error);
    }
  }

  function setSubmitting(isSubmitting) {
    if (DOM.sendBtn) {
      DOM.sendBtn.disabled = isSubmitting;
    }
    DOM.recipientInput.disabled = isSubmitting;
    DOM.messageInput.disabled = isSubmitting;

    if (DOM.btnSpinner) {
      DOM.btnSpinner.style.display = isSubmitting ? 'inline-block' : 'none';
    }
    if (DOM.btnText) {
      DOM.btnText.textContent = isSubmitting ? 'Sending...' : 'Send SMS';
    }
    const icon = DOM.sendBtn && DOM.sendBtn.querySelector('.btn-icon');
    if (icon) {
      icon.style.display = isSubmitting ? 'none' : 'inline-block';
    }
  }

  function hideAlert() {
    if (DOM.alertContainer) {
      DOM.alertContainer.style.display = 'none';
    }
  }

  function clearInputError(input, messageElement) {
    input.classList.remove('is-invalid');
    input.setAttribute('aria-invalid', 'false');
    if (messageElement) {
      messageElement.textContent = '';
      messageElement.style.display = 'none';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
