import { SET_ALERT, REMOVE_ALERT } from "./types";
import uuid from "uuid";

// passwords do not match, danger

/**  
 * {
    type: SET_ALERT 
     payload: 
     {
         msg: "Passwords do not match",
         alertType: "danger",
         id: uuid
     }

 }
 */

export const setAlert = (msg, alertType, timeout = 5000) => dispatch => {
  const id = uuid.v4();
  dispatch({
    type: SET_ALERT,
    payload: { msg, alertType, id }
  });

  setTimeout(() => dispatch({ type: REMOVE_ALERT, payload: id }), timeout);
};
