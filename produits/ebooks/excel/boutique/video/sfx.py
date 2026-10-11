#!/usr/bin/env python3
"""Synthétise les bruitages de la pub (numpy seul) : audio/sfx/*.wav, 44,1 kHz mono, crête -6 dBFS.
Écrit aussi audio/sfx/meta.json : « attaque » = instant du son où tombe l'impact (le mixeur
retranche cette valeur pour que l'impact tombe pile sur l'événement visuel)."""
import numpy as np, wave, json, os
SR = 44100
ici = os.path.dirname(os.path.abspath(__file__))
sortie = f'{ici}/audio/sfx'; os.makedirs(sortie, exist_ok=True)
rng = np.random.default_rng(237)
T = lambda d: np.arange(int(SR * d)) / SR

def norm(x, db=-6.0):
    return (x / np.max(np.abs(x)) * 10 ** (db / 20)).astype(np.float32)

def fondu(x, ms=4):
    n = int(SR * ms / 1000); x = x.copy(); x[:n] *= np.linspace(0, 1, n); x[-n:] *= np.linspace(1, 0, n); return x

def svf_bandpass(x, fc, q):
    """filtre à variable d'état, fréquence centrale fc (tableau) : balayage."""
    f = 2 * np.sin(np.pi * np.minimum(fc, SR / 6) / SR); d = 1 / q
    low = band = 0.0; y = np.empty_like(x)
    for i in range(len(x)):
        low += f[i] * band
        high = x[i] - low - d * band
        band += f[i] * high
        y[i] = band
    return y

def passe_haut(x, fc):
    a = np.exp(-2 * np.pi * fc / SR); y = np.empty_like(x); p = xp = 0.0
    for i in range(len(x)):
        p = a * (p + x[i] - xp); xp = x[i]; y[i] = p
    return y

def whoosh(d=0.35):
    t = T(d); n = rng.standard_normal(len(t))
    fc = 350 * (3600 / 350) ** (t / d) ** 0.9           # balayage 350 Hz -> 3,6 kHz
    y = svf_bandpass(n, fc, 1.3)
    env = np.sin(np.pi * np.clip(t / d, 0, 1) ** 0.75) ** 2   # montée douce, pic vers 0,18 s
    return norm(fondu(y * env, 8))

def pop(d=0.08):
    t = T(d); f = 180 + 420 * np.exp(-t / 0.018)           # chute de hauteur
    ph = 2 * np.pi * np.cumsum(f) / SR
    return norm(fondu(np.sin(ph) * np.exp(-t / 0.022) * (1 - np.exp(-t / 0.0015)), 3))

def clic(d=0.03, f0=1900, g=1.0):
    t = T(d); n = passe_haut(rng.standard_normal(len(t)), 1500) * np.exp(-t / 0.004)
    corps = np.sin(2 * np.pi * f0 * t) * np.exp(-t / 0.006) * 0.8
    return fondu((n * 0.6 + corps) * g, 1)

def frappe(d=2.4):
    out = np.zeros(int(SR * d)); t = 0.02
    while t < d - 0.06:
        c = clic(0.03, f0=rng.uniform(1500, 2500), g=rng.uniform(0.45, 1.0))
        i = int(t * SR); out[i:i + len(c)] += c[:len(out) - i]
        t += rng.uniform(0.045, 0.12) * (1.0 if rng.random() > 0.12 else rng.uniform(1.6, 2.6))   # rythme irrégulier, petites pauses
    return norm(out)

def ding(d=0.7, f0=1175.0):
    t = T(d)
    y = np.sin(2 * np.pi * f0 * t) * np.exp(-t / 0.20) + 0.4 * np.sin(2 * np.pi * 2 * f0 * t) * np.exp(-t / 0.10)
    return norm(fondu(y * (1 - np.exp(-t / 0.002)), 3))

def buzz(d=0.3):
    t = T(d); f = 95 + 10 * np.sin(2 * np.pi * 7 * t)
    ph = 2 * np.pi * np.cumsum(f) / SR
    y = sum(np.sin((2 * k + 1) * ph) / (2 * k + 1) ** 1.6 for k in range(5))    # carré adouci : 5 harmoniques impaires
    env = np.minimum(1, t / 0.012) * np.minimum(1, (d - t) / 0.08)
    return norm(fondu(y * env * (0.8 + 0.2 * np.sin(2 * np.pi * 22 * t)), 4))

def caisse(d=0.75):
    out = np.zeros(int(SR * d))
    for dt, f0 in ((0.0, 1568.0), (0.09, 2093.0)):
        t = T(d - dt); y = np.sin(2 * np.pi * f0 * t) * np.exp(-t / 0.17) + 0.35 * np.sin(2 * np.pi * 2.76 * f0 * t) * np.exp(-t / 0.06)
        y *= (1 - np.exp(-t / 0.0015)); i = int(dt * SR); out[i:i + len(y)] += y
        tb = T(0.07); m = passe_haut(rng.standard_normal(len(tb)), 5000) * np.exp(-tb / 0.02) * 0.5   # bruit métallique léger
        out[i:i + len(tb)] += m
    return norm(fondu(out, 4))

def ecrire(nom, x):
    with wave.open(f'{sortie}/{nom}.wav', 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(x, -1, 1) * 32767).astype('<i2').tobytes())

sons = {'whoosh': (whoosh(), 0.14), 'pop': (pop(), 0.003), 'clic': (clic(), 0.002),
        'frappe': (frappe(), 0.0), 'ding': (ding(), 0.0), 'buzz': (buzz(), 0.0), 'caisse': (caisse(), 0.0)}
meta = {}
for nom, (x, att) in sons.items():
    x = norm(x); ecrire(nom, x)
    meta[nom] = {'attaque': att, 'duree': round(len(x) / SR, 3), 'crete_dbfs': float(round(20 * np.log10(np.max(np.abs(x))), 2))}
json.dump(meta, open(f'{sortie}/meta.json', 'w'), indent=1)
print(json.dumps(meta))
