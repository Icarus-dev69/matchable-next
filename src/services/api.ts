import axios from 'axios';
import emailjs from "emailjs-com";

const baseURL = "https://codetest-backend-wp9t.onrender.com";

export const fetchSessions = async (type = "", trainer = "") => {
  let url = `${baseURL}/sessions`;
  if (type || trainer) {
    const params = new URLSearchParams();
    if (type) params.append("type", type);
    if (trainer) params.append("trainer", trainer);
    url += `?${params.toString()}`;
  }
  return axios.get(url).then(res => res.data);
};

export const bookMultipleSessions = async (
    cart: { id: number }[],
    user: { name: string; email: string; phone: string },
    formRef: React.RefObject<HTMLFormElement | null>,
  ) => {
    try {
      await Promise.all(
        cart.map((session) =>
          axios.post(`${baseURL}/bookings`, {
            user_name: user.name,
            user_email: user.email,
            user_phone: user.phone,
            session_id: session.id,
          })
        )
      );
  
      if (formRef.current) {
        await emailjs.sendForm(
          "service_ma7wvgm",
          "template_p8h72np",
          formRef.current,
          "UjcYUjRoEAf2zjHJg"
        );
      }
  
      return { success: true };
    } catch (error) {
      console.error(error);
      return { success: false };
    }
};

