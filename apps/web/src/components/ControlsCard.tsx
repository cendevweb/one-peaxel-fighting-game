import { PLAYER_BINDINGS, SECOND_PLAYER_BINDINGS, type Binding } from '@/input/keyboard';

const prettyCode = (code: string): string =>
    code
        .replace('ShiftRight', 'Maj dr.')
        .replace('Arrow', '')
        .replace('Key', '')
        .replace('Numpad', 'Pavé ')
        .replace('Space', 'Espace')
        .replace('Left', '←')
        .replace('Right', '→')
        .replace('Up', '↑')
        .replace('Down', '↓');

function Row({ binding }: { binding: Binding }): React.ReactElement {
    return (
        <div className="flex items-center justify-between gap-4 border-b border-line/50 py-1.5 last:border-0">
            <span className="text-sm text-muted">{binding.label}</span>
            <span className="flex gap-1">
                {binding.codes.map((code) => (
                    <kbd
                        key={code}
                        className="min-w-7 border border-line bg-surface-3 px-1.5 py-0.5 text-center text-[0.7rem] font-semibold"
                    >
                        {prettyCode(code)}
                    </kbd>
                ))}
            </span>
        </div>
    );
}

export function ControlsCard({ showSecond = false }: { showSecond?: boolean }): React.ReactElement {
    return (
        <div className="grid gap-6 sm:grid-cols-2">
            <div>
                <h3 className="label mb-2">Commandes</h3>
                {PLAYER_BINDINGS.map((binding) => (
                    <Row key={binding.label} binding={binding} />
                ))}
            </div>
            {showSecond ? (
                <div>
                    <h3 className="label mb-2">Joueur 2 (même clavier)</h3>
                    {SECOND_PLAYER_BINDINGS.map((binding) => (
                        <Row key={binding.label} binding={binding} />
                    ))}
                </div>
            ) : (
                <div>
                    <h3 className="label mb-2">À savoir</h3>
                    <ul className="space-y-2 text-sm text-muted">
                        <li>
                            La garde a sa propre touche : elle cloue sur place tant qu&apos;elle est tenue,
                            ne tient qu&apos;au sol, et l&apos;ultime passe à travers. Reculer n&apos;est plus
                            qu&apos;un déplacement.
                        </li>
                        <li>
                            Un coup léger qui touche s&apos;annule en coup lourd, puis en spéciale : c&apos;est la
                            base des enchaînements.
                        </li>
                        <li>
                            La jauge se remplit quand tu frappes et quand tu encaisses. Pleine, elle paie l&apos;ultime.
                        </li>
                        <li>Deux rounds gagnés emportent le match. Le round dure une minute.</li>
                    </ul>
                </div>
            )}
        </div>
    );
}
