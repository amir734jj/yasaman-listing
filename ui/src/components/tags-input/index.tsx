import { useState, type KeyboardEvent } from 'react';
import { Badge, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import './index.css';

interface TagsInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
}

export default function TagsInput({ tags, onTagsChange }: TagsInputProps) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState('');

  const addTag = (value: string) => {
    const tag = value.trim();
    if (!tag) return;
    if (!tags.some((x) => x.toLowerCase() === tag.toLowerCase())) {
      onTagsChange([...tags, tag]);
    }
    setDraft('');
  };

  const removeTag = (index: number) => {
    onTagsChange(tags.filter((_, i) => i !== index));
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(draft);
    } else if (e.key === 'Backspace' && draft === '' && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  return (
    <div className="tags-input form-control d-flex flex-wrap align-items-center gap-1">
      {tags.map((tag, index) => (
        <Badge key={`${tag}-${index}`} bg="secondary" className="tags-input-chip">
          {tag}
          <button
            type="button"
            className="tags-input-remove"
            aria-label={t('create.removeFile')}
            onClick={() => removeTag(index)}
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </Badge>
      ))}
      <Form.Control
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={() => addTag(draft)}
        placeholder={t('create.tagsPlaceholder')}
        className="tags-input-field border-0 shadow-none p-0"
      />
    </div>
  );
}
