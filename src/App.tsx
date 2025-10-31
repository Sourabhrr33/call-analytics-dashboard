import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Modal from './components/Modal';
import ChartCard from './components/ChartCard';
import { initializeFirebase, saveCustomChartData, getCustomChartData } from './services/firebaseService';
import type { CallDurationData, HostilityData } from './data/chartData';
import { 
    DUMMY_CALL_DURATION_DATA, 
    DUMMY_SAD_PATH_DATA, 
    DUMMY_HOSTILITY_DATA, 
    CHART_TITLE 
} from './data/chartData';

// --- Global UI Constants ---
const RADIAN = Math.PI / 180;
const INITIAL_INPUT_DATA: CallDurationData[] = DUMMY_CALL_DURATION_DATA.map(d => ({ ...d }));

// --- Recharts Helper ---

/**
 * Custom label rendering for the Pie Chart.
 */
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs font-semibold">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// --- MAIN APP COMPONENT ---

const App: React.FC = () => {
    // --- State Management ---
    const [userId, setUserId] = useState<string | null>(null);
    const [isFirebaseReady, setIsFirebaseReady] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [customChartData, setCustomChartData] = useState<CallDurationData[]>(DUMMY_CALL_DURATION_DATA);
    const [previousCustomData, setPreviousCustomData] = useState<CallDurationData[] | null>(null);
    const [inputData, setInputData] = useState<CallDurationData[]>(INITIAL_INPUT_DATA);
    
    // Auth and Initialization
    useEffect(() => {
        const init = async () => {
            try {
                // Ensure initializeFirebase completes and returns the user ID
                const { userId: uid } = await initializeFirebase();
                setUserId(uid);
            } catch (error) {
                console.error("Failed to initialize Firebase:", error);
                // On error, userId remains null, but we still set ready to move past loading
            } finally {
                setIsFirebaseReady(true); 
            }
        };
        init();
    }, []);

    // --- Interaction and Save Handlers ---

    const handleEditClick = () => {
        if (!userId) {
             console.error("User not authenticated. Click ignored.");
             return;
        }
        setInputData(customChartData.map(d => ({ ...d })));
        setEmail('');
        setPreviousCustomData(null);
        setIsModalOpen(true); 
    };

    const handleEmailSubmit = async () => { 
        if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            console.error("Please enter a valid email address."); 
            alert("Please enter a valid email address.");
            return;
        }
        
        // Use synchronous data retrieval
        try {
            const existingData = await getCustomChartData(userId!, email);
            
            if (existingData) {
                setPreviousCustomData(existingData as CallDurationData[]);
            } else {
                setPreviousCustomData(null);
            }
        } catch (error) {
            console.error("Error fetching custom data:", error);
            setPreviousCustomData(null); 
        }
    };

    const saveAndApplyData = useCallback(async () => {
        if (!userId || !email) return;

        try {
            // Prepare data for saving
            const dataToSave: CallDurationData[] = inputData.map(d => ({
                ...d,
                value: d.count 
            }));

            await saveCustomChartData(userId, email, dataToSave);
            
            setCustomChartData(dataToSave);
            setIsModalOpen(false);
            console.log("Custom data successfully saved and applied.");
        } catch (error) {
            console.error("Error saving data:", error);
            alert("Failed to save custom data.");
        }
    }, [userId, email, inputData]);

    const handleInputChange = (index: number, value: string) => {
        const newData = [...inputData];
        const parsedValue = parseInt(value) || 0;
        newData[index].count = parsedValue;
        newData[index].value = parsedValue; 
        setInputData(newData);
    };

    // --- Derived State and UI Logic ---

    const durationChartData = useMemo(() => {
        const totalCount = customChartData.reduce((sum, item) => sum + item.count, 0);
        return customChartData.map(d => ({ 
            ...d, 
            percentage: totalCount > 0 ? (d.count / totalCount) * 100 : 0
        }));
    }, [customChartData]);


    const renderModalContent = () => {
        const isOverwritePrompt = email && previousCustomData !== null;

        if (!email) {
            return (
                <div>
                    <p className="text-gray-300 mb-4">Enter your email to save and retrieve your custom chart data.</p>
                    <input
                        type="email"
                        placeholder="your.email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-3 mb-4 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-indigo-500"
                    />
                    <button onClick={handleEmailSubmit} className="w-full p-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 transition">
                        Next
                    </button>
                </div>
            );
        }
        
        if (isOverwritePrompt) {
            return (
                <div>
                    <p className="text-gray-300 mb-4">
                        We found custom data previously saved under **{email}**. Do you want to overwrite it?
                    </p>
                    <div className="text-sm bg-gray-700 p-3 rounded-lg mb-4 max-h-40 overflow-auto">
                         <p className="font-semibold text-white mb-1">Previous Values (Saved):</p>
                         {previousCustomData?.map((d, i) => (
                             <p key={i} className="text-gray-400">{d.name}: {d.count}</p>
                         ))}
                         <p className="font-semibold text-white mt-3 mb-1">New Values (Current Draft):</p>
                         {inputData?.map((d, i) => (
                             <p key={i} className="text-gray-400">{d.name}: {d.count}</p>
                         ))}
                    </div>
                    <div className="flex justify-end space-x-4">
                        <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-white border border-gray-600 rounded-lg hover:bg-gray-700 transition">
                            Cancel
                        </button>
                        <button onClick={saveAndApplyData} className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-500 transition">
                            Yes, Overwrite
                        </button>
                    </div>
                </div>
            );
        }

        // Default editing view
        return (
            <div>
                <p className="text-gray-300 mb-4">Edit the raw count values for the **{CHART_TITLE}**.</p>
                {inputData.map((data, index) => (
                    <div key={data.name} className="flex items-center space-x-3 mb-3">
                        <label className="text-gray-300 w-1/3">{data.name}</label>
                        <input
                            type="number"
                            value={inputData[index].count.toString()}
                            onChange={(e) => handleInputChange(index, e.target.value)}
                            className="w-2/3 p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-indigo-500"
                        />
                    </div>
                ))}
                <button onClick={saveAndApplyData} className="w-full mt-4 p-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 transition">
                    Save & Apply Data
                </button>
            </div>
        );
    };

    // Determine if the app is still initializing or failed to auth
    const isAuthLoading = !isFirebaseReady || userId === null;

    if (!isFirebaseReady && userId === null) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white text-xl">Initializing Firebase...</div>;
    }


    return (
        <div className="min-h-screen bg-gray-900 font-sans p-6 md:p-10 text-gray-100">
            {/* Tailwind CSS and Font Configuration */}
            <script src="https://cdn.tailwindcss.com"></script>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
                body { font-family: 'Inter', sans-serif; }
                .recharts-default-tooltip {
                    background-color: #1f2937 !important;
                    border: 1px solid #4f46e5 !important;
                    border-radius: 8px !important;
                    color: #fff !important;
                }
            `}</style>
            
            <header className="mb-10 border-b border-gray-700 pb-4">
                <h1 className="text-4xl font-bold text-indigo-400">Agent Call Analytics Dashboard</h1>
                <p className="text-gray-400 mt-2">
                    Visualizing Voice Agent Performance and User Interactions.
                    {/* Display authentication status */}
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${userId ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                        {userId ? `Connected: ${userId.substring(0, 8)}...` : 'Not Connected'}
                    </span>
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart 1: Customizable Call Duration Analysis (Line Chart) */}
                <ChartCard 
                    title={CHART_TITLE}
                    allowEdit={true} 
                    onEdit={handleEditClick}
                    isDisabled={isAuthLoading}
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={durationChartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="name" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4f46e5', borderRadius: '8px' }}
                                labelStyle={{ color: '#fff' }}
                            />
                            <Legend />
                            <Line 
                                type="monotone" 
                                dataKey="count" 
                                stroke="#8b5cf6" 
                                strokeWidth={3} 
                                dot={{ fill: '#8b5cf6', r: 4 }}
                                activeDot={{ r: 8 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* Chart 2: Sad Path Analysis (Bar Chart) */}
                <ChartCard title="Sad Path Analysis (Top Issues)">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={DUMMY_SAD_PATH_DATA} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis type="number" stroke="#9ca3af" />
                            <YAxis dataKey="issue" type="category" stroke="#9ca3af" interval={0} tick={{ fontSize: 10 }} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4f46e5', borderRadius: '8px' }}
                                labelStyle={{ color: '#fff' }}
                            />
                            <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                                {DUMMY_SAD_PATH_DATA.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* Chart 3: Customer Hostility Distribution (Pie Chart) */}
                <ChartCard title="Customer Hostility Level">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                            <Pie
                                data={DUMMY_HOSTILITY_DATA}
                                dataKey="value"
                                nameKey="label"
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                fill="#8884d8"
                                labelLine={false}
                                label={renderCustomizedLabel}
                                innerRadius={60}
                            >
                                {DUMMY_HOSTILITY_DATA.map((entry: HostilityData,) => (
                                    <Cell key={`cell-${entry.label}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4f46e5', borderRadius: '8px' }}
                                labelStyle={{ color: '#fff' }}
                            />
                            <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ paddingBottom: '10px' }}/>
                        </PieChart>
                    </ResponsiveContainer>
                </ChartCard>
                
            </div>
            
            {/* Customization Modal */}
            <Modal
                title={email ? (previousCustomData ? "Confirm Overwrite" : "Edit Chart Data") : "Enter Email"}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            >
                {renderModalContent()}
            </Modal>
        </div>
    );
};

export default App;
