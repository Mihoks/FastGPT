import { useState, useRef, useTransition, useEffect, useMemo } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { Box } from '@chakra-ui/react';
import styles from './index.module.scss';
import { EditorState, LexicalEditor } from 'lexical';
import { getNanoid } from '@fastgpt/global/common/string/tools';
import { EditorVariablePickerType } from '../../Textarea/PromptEditor/type';
import { VariableNode } from '../../Textarea/PromptEditor/plugins/VariablePlugin/node';
import { textToEditorState } from '../../Textarea/PromptEditor/utils';
import DropDownMenu from '../../Textarea/PromptEditor/modules/DropDownMenu';
import { SingleLinePlugin } from '../../Textarea/PromptEditor/plugins/SingleLinePlugin';
import OnBlurPlugin from '../../Textarea/PromptEditor/plugins/OnBlurPlugin';
import VariablePlugin from '../../Textarea/PromptEditor/plugins/VariablePlugin';
import VariablePickerPlugin from '../../Textarea/PromptEditor/plugins/VariablePickerPlugin';
import FocusPlugin from '../../Textarea/PromptEditor/plugins/FocusPlugin';

export default function Editor({
  h = 40,
  hasVariablePlugin = true,
  hasDropDownPlugin = false,
  variables,
  onChange,
  onBlur,
  value,
  currentValue,
  placeholder = '',
  setDropdownValue,
  updateTrigger
}: {
  h?: number;
  hasVariablePlugin?: boolean;
  hasDropDownPlugin?: boolean;
  variables: EditorVariablePickerType[];
  onChange?: (editorState: EditorState) => void;
  onBlur?: (editor: LexicalEditor) => void;
  value?: string;
  currentValue?: string;
  placeholder?: string;
  setDropdownValue?: (value: string) => void;
  updateTrigger?: boolean;
}) {
  const [key, setKey] = useState(getNanoid(6));
  const [_, startSts] = useTransition();
  const [focus, setFocus] = useState(false);

  const initialConfig = {
    namespace: 'HttpInput',
    nodes: [VariableNode],
    editorState: textToEditorState(value),
    onError: (error: Error) => {
      throw error;
    }
  };

  useEffect(() => {
    if (focus) return;
    setKey(getNanoid(6));
  }, [value, variables.length]);

  useEffect(() => {
    setKey(getNanoid(6));
  }, [updateTrigger]);

  const dropdownVariables = useMemo(
    () =>
      variables.filter((item) => {
        return item.key.includes(currentValue || '') && item.key !== currentValue;
      }),
    [currentValue]
  );

  return (
    <Box position={'relative'} width={'full'} h={`${h}px`} cursor={'text'}>
      <LexicalComposer initialConfig={initialConfig} key={key}>
        <PlainTextPlugin
          contentEditable={<ContentEditable className={styles.contentEditable} />}
          placeholder={
            <Box
              position={'absolute'}
              top={0}
              left={0}
              right={0}
              bottom={0}
              py={3}
              px={2}
              pointerEvents={'none'}
              overflow={'overlay'}
            >
              <Box
                color={'myGray.500'}
                fontSize={'xs'}
                userSelect={'none'}
                whiteSpace={'pre-wrap'}
                wordBreak={'break-all'}
                h={'100%'}
              >
                {placeholder}
              </Box>
            </Box>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <FocusPlugin focus={focus} setFocus={setFocus} />
        <OnChangePlugin
          onChange={(e) => {
            startSts(() => {
              onChange?.(e);
            });
          }}
        />
        {hasVariablePlugin ? <VariablePickerPlugin variables={variables} /> : ''}
        {hasVariablePlugin ? <VariablePlugin variables={variables} /> : ''}
        <OnBlurPlugin onBlur={onBlur} />
        <SingleLinePlugin />
      </LexicalComposer>
      {focus && hasDropDownPlugin && (
        <DropDownMenu variables={dropdownVariables} setDropdownValue={setDropdownValue} />
      )}
    </Box>
  );
}
