type Props = {
    onAddClick: () => void;
};


export default function Header({ onAddClick }: Props) {
    return (
        <header className="flex justify-between items-center px-6 py-4 shadow-md">
            <h1 className="text-2xl text-gray-500 font-bold">ToDo</h1>
            <button onClick={onAddClick} className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-md hover:bg-blue-600 transition">
                +
            </button>
        </header>
    );
}