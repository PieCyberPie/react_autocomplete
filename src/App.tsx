/* eslint-disable @typescript-eslint/indent */
import React, { useState } from 'react';
import './App.scss';
import { peopleFromServer } from './data/people';
import classNames from 'classnames';
import { Person } from './types/Person';
import { useEffect, useRef } from 'react';

export const App: React.FC = () => {
  const [inputFocused, setInputFocused] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debounceDelay, setDebounceDelay] = useState(300); // Customizable delay
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const useDebounce = <T,>(value: T, delay = 300): T => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
      const handler = setTimeout(() => setDebouncedValue(value), delay);

      return () => clearTimeout(handler);
    }, [value, delay]);

    return debouncedValue;
  };

  const debouncedQuery = useDebounce(searchQuery, debounceDelay);

  const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setSelectedPerson(null);
  };

  const handlePersonSelect = (newTarget: Person) => {
    setSelectedPerson(newTarget);
    setInputFocused(false); // Close the dropdown after selecting a person
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setInputFocused(false); // Close the dropdown
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter people based on the debounced query
  const filteredPeople = peopleFromServer.filter(person =>
    debouncedQuery
      ? person.name.toLowerCase().includes(debouncedQuery.toLowerCase())
      : inputFocused,
  );

  return (
    <div className="container">
      <main className="section is-flex is-flex-direction-column">
        {!selectedPerson ? (
          <h1 className="title" data-cy="title">
            No selected person
          </h1>
        ) : (
          <h1 className="title" data-cy="title">
            {`${selectedPerson.name} (${selectedPerson.born} - ${selectedPerson.died})`}
          </h1>
        )}
        <div
          ref={dropdownRef} // Attach ref to the dropdown
          className={classNames('dropdown', {
            'is-active': inputFocused,
          })}
        >
          <div className="dropdown-trigger">
            <input
              type="text"
              placeholder="Enter a part of the name"
              className="input"
              onChange={handleQueryChange}
              onFocus={() => setInputFocused(true)}
              data-cy="search-input"
            />
          </div>

          <div className="dropdown-menu" role="menu" data-cy="suggestions-list">
            <div className="dropdown-content">
              {filteredPeople.length > 0 ? (
                filteredPeople.map(person => (
                  <div
                    className="dropdown-item"
                    data-cy="suggestion-item"
                    key={person.slug}
                    tabIndex={0}
                  >
                    <a
                      className="has-text-link"
                      onClick={() => handlePersonSelect(person)}
                    >
                      {person.name}
                    </a>
                  </div>
                ))
              ) : (
                <></>
              )}
            </div>
          </div>
        </div>
        {debouncedQuery && filteredPeople.length === 0 && (
          <div
            className="notification
            is-danger
            is-light
            mt-3
            is-align-self-flex-start"
            role="alert"
            data-cy="no-suggestions-message"
          >
            <p className="has-text-danger">No matching suggestions</p>
          </div>
        )}
      </main>
    </div>
  );
};
