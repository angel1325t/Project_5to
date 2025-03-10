const togglePassword = document.getElementById('togglePassword');
const password = document.getElementById('password');
togglePassword.addEventListener('click', function () {
    const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
    password.setAttribute('type', type);
    this.innerHTML = type === 'password' ? '<img src="/static/icons/eye.svg" alt="">' : '<img src="/static/icons/eye-slash.svg" alt="">';
});

const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
const confirmPassword = document.getElementById('confirm_password');
toggleConfirmPassword.addEventListener('click', function () {
    const type = confirmPassword.getAttribute('type') === 'password' ? 'text' : 'password';
    confirmPassword.setAttribute('type', type);
    this.innerHTML = type === 'password' ? '<img src="../../static/icons/eye.svg" alt="">' : '<img src="../../static/icons/eye-slash.svg" alt="">';
});
