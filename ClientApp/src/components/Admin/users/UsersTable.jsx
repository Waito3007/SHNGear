import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, PlusCircle, Pencil, Trash2 } from "lucide-react";

const UsersTable = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await fetch("https://localhost:7107/api/User");
        if (!response.ok) {
          throw new Error("Error fetching users");
        }
        const data = await response.json();
        setUsers(data);
        setFilteredUsers(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = users.filter(
      (user) => user.name.toLowerCase().includes(term) || user.email.toLowerCase().includes(term)
    );
    setFilteredUsers(filtered);
  };

  return (
    <motion.div
      className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      {/* Header */}
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-xl font-semibold text-gray-100'>Users</h2>
        <div className='flex space-x-3'>
          {/* Add User Button */}
          <button className='flex items-center text-sm text-white bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg'>
            <PlusCircle size={18} className='mr-2' />
            Add User
          </button>
          {/* Add Role Button */}
          <button className='flex items-center text-sm text-white bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg'>
            <PlusCircle size={18} className='mr-2' />
            Add Role
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className='relative mb-4'>
        <input
          type='text'
          placeholder='Search users...'
          className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full'
          value={searchTerm}
          onChange={handleSearch}
        />
        <Search className='absolute left-3 top-2.5 text-gray-400' size={18} />
      </div>

      {/* Users Table */}
      <div className='overflow-x-auto'>
        <table className='min-w-full divide-y divide-gray-700'>
          <thead>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Name</th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Email</th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Role</th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Status</th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Actions</th>
            </tr>
          </thead>

          <tbody className='divide-y divide-gray-700'>
            {filteredUsers.map((user) => (
              <motion.tr
                key={user.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='flex items-center'>
                    <div className='flex-shrink-0 h-10 w-10'>
                      <div className='h-10 w-10 rounded-full bg-gradient-to-r from-purple-400 to-blue-500 flex items-center justify-center text-white font-semibold'>
                        {user.name ? user.name.charAt(0) : "?"}
                      </div>
                    </div>
                    <div className='ml-4'>
                      <div className='text-sm font-medium text-gray-100'>{user.name}</div>
                    </div>
                  </div>
                </td>

                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='text-sm text-gray-300'>{user.email}</div>
                </td>

                <td className='px-6 py-4 whitespace-nowrap'>
                  <span className='px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-800 text-blue-100'>
                    {user.role ? user.role.name : "N/A"}
                  </span>
                </td>

                <td className='px-6 py-4 whitespace-nowrap'>
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.status === "Active"
                        ? "bg-green-800 text-green-100"
                        : "bg-red-800 text-red-100"
                    }`}
                  >
                    {user.status}
                  </span>
                </td>

                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                  <button
                    className='text-indigo-400 hover:text-indigo-300 mr-4'
                    onClick={() => console.log("Edit", user.id)}
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    className='text-red-400 hover:text-red-300'
                    onClick={() => console.log("Delete", user.id)}
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default UsersTable;