export function Brand({ compact = false }: { compact?: boolean }): React.ReactElement {
    return (
        <div className={compact ? 'select-none' : 'select-none text-center'}>
            <div
                className={`display leading-[0.85] ${compact ? 'text-2xl' : 'text-6xl sm:text-8xl'}`}
                style={{ letterSpacing: '0.02em' }}
            >
                <span className="block text-text">ONE</span>
                <span
                    className="block bg-gradient-to-r from-accent via-accent-2 to-accent bg-clip-text text-transparent"
                    style={{ WebkitTextStroke: compact ? '0' : '1px rgba(0,0,0,0.35)' }}
                >
                    PEAXEL
                </span>
                {!compact ? <span className="block text-text">FIGHTING GAME</span> : null}
            </div>
            {!compact ? (
                <p className="label mt-3">Combat 2D en ligne · inspiré de Gigant Battle 2</p>
            ) : null}
        </div>
    );
}
