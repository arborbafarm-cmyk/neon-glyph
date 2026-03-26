import { usePlayerStore } from 'path/to/player/store';

const Header = () => {
    // Get dirtyMoney and cleanMoney from usePlayerStore
    const { dirtyMoney, cleanMoney } = usePlayerStore();

    return (
        <header>
            <h1>Game Title</h1>
            <div>
                <p>Dirty Money: {dirtyMoney}</p>
                <p>Clean Money: {cleanMoney}</p>
            </div>
        </header>
    );
};

export default Header;