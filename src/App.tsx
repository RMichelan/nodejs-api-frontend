import { useEffect, useState, useRef, FormEvent } from 'react';
import { api } from './services/api';
import { FiTrash, FiEdit } from 'react-icons/fi';

interface CustomerProps {
  id: string;
  name: string;
  email: string;
  status: boolean;
  created_at: string;
}

export default function App() {
  const [customers, setCustomers] = useState<CustomerProps[]>([]);
  const [idToUpdate, setIdToUpdate] = useState<string | undefined>(undefined);

  const nameRef = useRef<HTMLInputElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);

  async function loadCustomer() {
    const response = await api.get("/read");
    setCustomers(response.data.rows);
  }

  // Submit form with fields values
  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    let name = nameRef.current?.value;
    let email = emailRef.current?.value;

    if (!name || !email) return;

    if (idToUpdate) {
      await handleUpdate(idToUpdate, name, email)
        .then(() => setIdToUpdate(undefined))
        .finally(() => clearFields());

      return;
    }

    await handleCreate(name, email);
  }

  // Create customer
  async function handleCreate(name: string, email: string) {
    const response = await api.post("/create", { name, email });

    setCustomers(currentCustomers => [...currentCustomers, response.data.rows]);
  }

  // Update customer
  async function handleUpdate(id: string, name: string, email: string) {
    const query = { params: { id } };
    const body = { name, email };

    await api.patch("/update", body, query);

    const updatedCustomers = customers.map(customer => customer.id === id ? { id, name, email } : customer);
    setCustomers(updatedCustomers);
  }

  // Delete customer
  async function handleDelete(id: string) {
    await api.delete("/delete", { params: { id } });

    let newCustomers = customers.filter(customer => customer.id !== id);

    setCustomers(newCustomers);
  }

  function setValuesToEdit(id: string, name: string, email: string) {
    setIdToUpdate(id);

    nameRef.current.value = name;
    emailRef.current.value = email;
  }

  function clearFields() {
    nameRef.current.value = "";
    emailRef.current.value = "";
  }

  useEffect(() => {
    loadCustomer();
  }, []);

  return (
    <div className="w-full min-h-screen bg-gray-900 flex justify-center px-4">
      <main className="my-10 w-full md:max-w-2xl">
        <h1 className="text-4xl font-medium text-white">Customers</h1>

        <form className="flex flex-col my-6" onSubmit={handleSubmit}>
          {/* Name */}
          <label className="font-medium text-white">Name</label>
          <input
            type="text"
            placeholder="John Doe"
            className="w-full mb-5 p-2 rounded bg-transparent border border-gray-600 text-gray-300"
            ref={nameRef}
          />

          {/* Email */}
          <label className="font-medium text-white">E-mail</label>
          <input
            type="text"
            placeholder="email@example.com"
            className="w-full mb-5 p-2 rounded bg-transparent border border-gray-600 text-gray-300"
            ref={emailRef}
          />

          {/* Button Submit */}
          <input
            type="submit"
            value={`${idToUpdate ? "Update Customer" : "Add Customer"}`}
            className="cursor-pointer w-full p-2 bg-teal-700 rounded font-bold text-white hover:opacity-75 duration-200"
          />
        </form>

        <hr className="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700" />

        {/* List Customers */}
        <section className="flex flex-col gap-4">
          {customers.map((customer) => (
            <article
              key={customer.id}
              className="w-full bg-gray-800 rounded p-2 relative hover:scale-105 duration-300"
            >
              <p><span className="font-bold text-gray-400">Name:</span> <span className="text-white">{customer.name}</span></p>
              <p><span className="font-bold text-gray-400">E-mail:</span> <span className="text-white">{customer.email}</span></p>
              <p><span className="font-bold text-gray-400">Created At:</span> <span className="text-white">{customer.created_at}</span></p>

              {/* Action Buttons */}
              <button
                className="bg-yellow-700 w-7 h-7 flex items-center justify-center rounded-lg absolute -right-2 -top-2"
                onClick={() => setValuesToEdit(customer.id, customer.name, customer.email)}
              >
                <FiEdit size={18} color="#FFFFFF" />
              </button>
              <button
                className="bg-red-700 w-7 h-7 flex items-center justify-center rounded-lg absolute -right-2 top-8"
                onClick={() => handleDelete(customer.id)}
              >
                <FiTrash size={18} color="#FFFFFF" />
              </button>
            </article>
          ))}

        </section>
      </main>
    </div>
  )
}