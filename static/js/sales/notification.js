
export function setupNotifications() {
    return new Notyf({
        duration: 3000,
        position: { x: 'right', y: 'top' },
        dismissible: true,
    });
}