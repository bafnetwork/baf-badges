import { login } from '../utils/init';

export function NotSignedIn() {
	return (
		<main>
        <h1>It looks like you&apos;re not signed in.</h1>
        <p>
          Please sign in with NEAR wallet to proceed.
        </p>
        <p style={{ textAlign: 'center', marginTop: '2.5em' }}>
          <button onClick={login}>Sign in</button>
        </p>
      </main>
	)
}
