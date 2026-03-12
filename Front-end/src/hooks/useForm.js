import { useState } from 'react';

/**
 * useForm — generic form state and submission handler
 *
 * @param {Object} initialValues  - initial field values { email: '', password: '', ... }
 * @param {Function} onSubmit     - async fn(values) — throw Error on failure, resolve on success
 * @returns {{ values, handleChange, handleSubmit, loading, reset }}
 */
export function useForm(initialValues, onSubmit) {
  const [values, setValues] = useState(initialValues);
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(values);
    } catch (err) {
      window.alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setValues(initialValues);
  }

  return { values, handleChange, handleSubmit, loading, reset };
}
