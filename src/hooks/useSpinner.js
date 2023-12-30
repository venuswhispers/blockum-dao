import { useContext } from "react";
import { SpinnerContext } from "../contexts/spinnerContext";

/**
 * hook for using spin
 * @returns context {openSpin(text), closeSpin}
 */
const useSpinner = () => {
  const context = useContext(SpinnerContext);
  return context;
}

export default useSpinner;