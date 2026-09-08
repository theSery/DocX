export const NotificationMethodEnum = Object.freeze({
  ELECTRONIC: 'electronic',
  ON_PAPER: 'on_paper',
});

export const notificationMethods = [
  {
    id: NotificationMethodEnum.ELECTRONIC,
    nameHy: 'Էլեկտրոնային',
    nameEn: 'Electronic',
  },
  {
    id: NotificationMethodEnum.ON_PAPER,
    nameHy: 'Թղթային',
    nameEn: 'On paper',
  },
];

export default notificationMethods;
