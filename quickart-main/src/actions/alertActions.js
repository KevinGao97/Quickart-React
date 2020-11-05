import { SET_ALERT, REMOVE_ALERT } from '../constants';

export function setAlert(msg, alertType) {
    //return (dispatch) => {
    return (dispatch, getState) => {
        const id = Math.random().toString(36).substring(2);
        dispatch({
            type: SET_ALERT,
            payload: {
                msg,
                alertType, 
                id
            }
        })

        setTimeout(() => dispatch({
            type: REMOVE_ALERT,
            payload: id
        }), 5000);
    };
}

// export function removeAlert(id) {
//     //return (dispatch) => {
//     return (dispatch, getState) => {
//         dispatch({
//             type: REMOVE_ALERT,
//             payload: {
//                 id
//             }
//         })
//     };
// }