'use client'

import { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { bookMultipleSessions, fetchSessions } from '@/services/api';

interface Session {
  id: number;
  type: string;
  trainer: string;
  duration: number;
  price: number;
  time_slot: string;
}

interface User {
  name: string;
  email: string;
  phone: string;
}

const SessionCard: React.FC<{ session: Session; addToCart: (session: Session) => void }> = ({ session, addToCart }) => (
  <div className="border p-4 mb-2 rounded-md">
    <div className='flex items-center justify-between'>
      <h3 className='font-bold'>{session.type}</h3>
      <p>{new Date(session.time_slot).toLocaleString()}</p>
    </div>
    
    <p className='text-[18px] my-[10px]'>{session.trainer} ({session.duration}mins)</p>
    <div className='flex items-center justify-between'>
      <p className='font-bold'>${session.price}</p>
      <button
        onClick={() => addToCart(session)}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md cursor-pointer flex items-center gap-[5px]"
      >
        <Icon icon="mdi:cart-plus" width="24" height="24" />
        Add to Cart
      </button>
    </div>
    
  </div>
);

export default function Home() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [cart, setCart] = useState<Session[]>([]);
  const [user, setUser] = useState<User>({ name: "", email: "", phone: "" });
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [trainer, setTrainer] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const form = useRef<HTMLFormElement>(null);

  const [bookingLoading, setBookingLoading] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true)
    fetchSessions()
      .then(setSessions)
      .catch((error) => console.error("Error fetching sessions:", error));
    setLoading(false)
  }, []);

  const addToCart = (session: Session) => {
    console.log(session)
    if (cart.some((item) => item.id === session.id)) {
      toast.warn("This session is already in your cart.");
      return;
    }
    setCart([...cart, session]);
  };

  const removeFromCart = (sessionId: number) => {
    setCart(cart.filter((item) => item.id !== sessionId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingLoading(true)
    if (!user.name || !user.email || !user.phone || !termsAccepted) {
      setMessage("Please fill out all fields and accept the terms.");
      setBookingLoading(false)
      return;
    }
    if (cart.length === 0) {
      setMessage("Your Cart is empty.");
      setBookingLoading(false)
      return;
    }

    const result = await bookMultipleSessions(
      cart.map(({ id }) => ({ id })), 
      user,
      form,
    );
  
    if (result.success) {
      toast.success("Confirmation email sent successfully!");
      toast.success("Booking successful!");
      setCart([]);
      setUser({ name: "", email: "", phone: "" });
      setTermsAccepted(false);
    } else {
      toast.error("Booking failed. Please try again.");
    }

    setBookingLoading(false)
  };

  return (
    <>
      <ToastContainer />
      <div className="w-[90%] max-w-[800px] p-[20px] rounded-lg shadow-xl bg-white mx-auto my-[40px]">
      <h1 className="text-2xl font-bold mb-4 text-center">Matchable Checkout</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div >
          <h2 className="text-xl font-semibold mb-2">Available Sessions</h2>
          <div className='flex items-center gap-[10px] mb-2'>
            <input type="text" className="border p-2  w-full rounded-md" value={type} placeholder='Type...' onChange={(e) => setType(e.target.value)} />
            <input type='text' className="border p-2  w-full rounded-md" value={trainer} placeholder='Trainer...' onChange={(e) => setTrainer(e.target.value)} />
            <button type="button" onClick={() => {
              setLoading(true)
              fetchSessions(type, trainer)
              .then(setSessions)
              .catch((error) => console.error("Error fetching sessions:", error));
              setLoading(false)
            }} className="bg-green-500 text-white min-w-[100px] py-2 rounded-md cursor-pointer hover:bg-green-600">
              Filter
            </button>
          </div>
          <div className='max-h-[400px] overflow-auto custom-scroll'>
            {
              loading ? <p>Loading...</p>
              :
              sessions && sessions.length > 0 ? sessions.map((session) => (
                <SessionCard session={session} addToCart={addToCart} key={session.id}/>
              ))
              :
              <p>No Sessions Found!</p>
            }
            
          </div>
          
        </div>
        <div>
          <div className='flex items-center justify-between'>
            <h2 className="text-xl font-semibold mb-2 flex items-center gap-[5px]">
            <Icon icon="garden:shopping-cart-stroke-12" width="20" height="20" />
              Cart
              </h2>
              <p className="font-bold">
              Total: ${cart.reduce((sum, item) => Number(sum) + Number(item.price), 0)}
            </p>
          </div>
          <div className='max-h-[400px] overflow-auto custom-scroll'>
          {cart.map((item) => (
            <div key={item.id} className="border p-4 mb-2 rounded-md">
                <div className='flex items-center justify-between'>
                  <h3 className='font-bold'>{item.type}</h3>
                  <p>{new Date(item.time_slot).toLocaleString()}</p>
                </div>
                
                <p className='text-[18px] my-[10px]'>{item.trainer} ({item.duration}mins)</p>
                <div className='flex items-center justify-between'>
                  <p className='font-bold'>${item.price}</p>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md cursor-pointer flex items-center gap-[5px]"
                  >
                    <Icon icon="mdi:cart-minus" width="24" height="24" />
                    Remove
                  </button>
                </div>
                
              </div>
          ))}
          </div>
          
        </div>
      </div>
      <form ref={form} onSubmit={handleSubmit} className="mt-[60px]">
        <h2 className="text-xl font-semibold mb-2 text-center">Booking Form</h2>
        <input
          type="text"
          placeholder="Name"
          name='to_name'
          required
          value={user.name}
          onChange={(e) => setUser({ ...user, name: e.target.value })}
          className="border p-2 mb-2 w-full rounded-md"
        />
        <input
          type="email"
          placeholder="Email"
          name='to_email'
          value={user.email}
          onChange={(e) => setUser({ ...user, email: e.target.value })}
          className="border p-2 mb-2 w-full rounded-md"
        />
        <input
          type="tel"
          placeholder="Phone"
          value={user.phone}
          onChange={(e) => setUser({ ...user, phone: e.target.value })}
          className="border p-2 mb-2 w-full rounded-md"
        />
        <label className="block mb-2 flex items-center gap-[2px]" htmlFor='terms' >
          <input
            type="checkbox"
            name='terms'
            id='terms'
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
          />
          Accept terms and conditions
        </label>
        <input type='hidden' name='from_name' value="Matchable" />
        <input type='hidden' name='message' value="This is a confirmation email for your booking" />
        <div className='flex items-center gap-[10px] justify-center'>
          <button type="button" className="bg-none border text-black w-[100px] py-2 rounded-md cursor-pointer hover:bg-black hover:text-white">
            Clear
          </button>

          <button type="submit" disabled={bookingLoading} className={`bg-green-500 text-white w-[100px] py-2 rounded-md cursor-pointer hover:bg-green-600 ${bookingLoading ? 'opacity-[0.4]' : 'opacity-[1]'}`}>
            Book Now
          </button>

        </div>
        
      </form>
      {message && <p className="mt-4">{message}</p>}
    </div>
    </>
  );
}