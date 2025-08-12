import { useState } from 'react';
import { IconCheck, IconDots, IconExclamationMark } from '@tabler/icons-react';
import {
  ActionIcon,
  Alert,
  Button,
  Card,
  Checkbox,
  Container,
  Group,
  JsonInput,
  Menu,
  SegmentedControl,
  Stack,
  Table,
  Text,
  TextInput,
  Tooltip,
} from '@mantine/core';
import createPasta, { Pasta } from './createPasta';
import GameChecker from './GameChecker';
import getDefaultDifficulties from './getDefaultDifficulties';
import { Game, GAME_NAMES, ORDERED_PROPER_GAMES } from './goals';
import PastaFilter from './PastaFilter';
import { METADATA } from './pastas/metadata';

const options = [...METADATA.filter((d) => !d.isMenu).map((d) => d.name), 'Game Names', 'Custom'];
const menuOptions = METADATA.filter((d) => d.isMenu).map((d) => d.name);

export default function CreateBoard() {
  const [variant, setVariant] = useState(options[0]);
  const [custom, setCustom] = useState('');
  const [checkState, setCheckState] = useState<Map<Game, boolean>>(
    new Map(ORDERED_PROPER_GAMES.map((key) => [key, true]))
  );

  const [customizedPasta, setCustomizedPasta] = useState<null | Pasta>(null);

  const [randomizeGroupings, setRandomizeGroupings] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [roomName, setRoomName] = useState('');
  const [password, setPassword] = useState('');
  const [isLockout, setIsLockout] = useState(true);
  const [isCreationInProgress, setIsCreationInProgress] = useState(false);
  const [url, setUrl] = useState('');
  const [error, setError] = useState<Error | null>(null);

  const metadata = METADATA.find((d) => d.name === variant);
  const description =
    metadata != null ? (
      <Text size="sm">
        Last synced:{' '}
        {new Date(metadata.update_time * 1000).toLocaleString(undefined, {
          month: 'numeric',
          day: 'numeric',
          year: 'numeric',
        })}
      </Text>
    ) : variant === 'Game Names' ? (
      <GameChecker checkState={checkState} setCheckState={setCheckState} />
    ) : (
      <JsonInput
        autosize
        label="Add your pasta here:"
        maxRows={12}
        minRows={2}
        onChange={setCustom}
        spellCheck={false}
        validationError="Invalid JSON"
        value={custom}
      />
    );

  // for some reason it doesn't like checkState.values().filter(...)
  let checkedGameCount = 0;
  checkState.forEach((isChecked) => {
    if (isChecked) {
      checkedGameCount += 1;
    }
  });
  const hasLessThan25Games = checkedGameCount < 25;
  const isEligibleForCustomizedPasta = variant === 'Standard' || variant === 'Spicy';
  const isUsingCustomizedPasta = isEligibleForCustomizedPasta && showFilters;

  const getSerializedPasta = (pretty: boolean) => {
    if (variant === 'Custom') {
      return custom;
    }
    let structuredPasta;
    if (variant === 'Game Names') {
      structuredPasta = showFilters
        ? Array.from(checkState.entries().filter(([gameKey, checkState]) => checkState)).map(
            ([gameKey, _]) => ({ name: GAME_NAMES[gameKey] })
          )
        : ORDERED_PROPER_GAMES.map((gameKey) => ({ name: GAME_NAMES[gameKey] }));
    } else if (isUsingCustomizedPasta && customizedPasta != null) {
      structuredPasta = customizedPasta;
    } else if (metadata != null) {
      structuredPasta = randomizeGroupings
        ? createPasta(
            // TODO: Fix typing of pastas to be less strict
            metadata.pasta as any,
            getDefaultDifficulties(metadata.pasta as any)
          )
        : metadata.pasta;
    } else {
      return 'Error constructing pasta';
    }
    return pretty ? JSON.stringify(structuredPasta, null, 4) : JSON.stringify(structuredPasta);
  };

  return (
    <Container my="md">
      <Card shadow="sm" padding="sm" radius="md" withBorder>
        <Stack gap={8}>
          <Text>
            <strong>Choose variant</strong>
          </Text>
          <Group gap="sm">
            <SegmentedControl
              style={{ flexGrow: 1 }}
              data={options}
              fullWidth={true}
              onChange={setVariant}
              value={variant}
            />
            <Menu shadow="md" width={200}>
              <Menu.Target>
                <ActionIcon onClick={() => {}} variant="default">
                  <IconDots size={16} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                {menuOptions.map((option) => (
                  <Menu.Item onClick={() => setVariant(option)}>{option}</Menu.Item>
                ))}
              </Menu.Dropdown>
            </Menu>
          </Group>
          {metadata != null && (
            <Text size="sm">
              Last synced:{' '}
              {new Date(metadata.update_time * 1000).toLocaleString(undefined, {
                month: 'numeric',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
          )}
          {(isEligibleForCustomizedPasta || variant === 'Game Names') && (
            <Group>
              {variant !== 'Game Names' && (
                <Tooltip
                  label={
                    <span>
                      Games will be divided into groups randomly while still respecting the
                      <br />
                      difficulty distribution, allowing for greater card variety than using the
                      <br />
                      default pasta. This option is always enabled when customizing games and
                      <br />
                      difficulty counts.
                    </span>
                  }
                >
                  <Checkbox
                    checked={showFilters || randomizeGroupings}
                    label="Randomize goal groupings"
                    onChange={(event) => setRandomizeGroupings(event.currentTarget.checked)}
                  />
                </Tooltip>
              )}
              <Checkbox
                checked={showFilters}
                label="Customize games and difficulty counts"
                onChange={(event) => setShowFilters(event.currentTarget.checked)}
              />
            </Group>
          )}
          {variant === 'Game Names' && showFilters && (
            <>
              <GameChecker checkState={checkState} setCheckState={setCheckState} />
              {hasLessThan25Games && (
                <Alert
                  variant="light"
                  color="red"
                  title="Error: You must select at least 25 games"
                />
              )}
            </>
          )}
          {metadata != null && isEligibleForCustomizedPasta && showFilters && (
            <PastaFilter
              key={variant}
              checkState={checkState}
              setCheckState={setCheckState}
              // TODO: Fix up the typing here to get rid of the any
              pasta={metadata.pasta as any}
              onChangePasta={setCustomizedPasta}
            />
          )}
          {variant === 'Custom' && (
            <JsonInput
              autosize
              label="Add your pasta here:"
              maxRows={12}
              minRows={2}
              onChange={setCustom}
              spellCheck={false}
              validationError="Invalid JSON"
              value={custom}
            />
          )}
          <Text>
            <strong>Configure Room</strong>
          </Text>
          <TextInput
            label="Room name"
            value={roomName}
            onChange={(event) => setRoomName(event.currentTarget.value)}
          />
          <TextInput
            label="Password"
            value={password}
            onChange={(event) => setPassword(event.currentTarget.value)}
          />
          <Checkbox
            checked={isLockout}
            label="Lockout"
            onChange={(event) => setIsLockout(event.currentTarget.checked)}
          />
          <Button
            disabled={
              isCreationInProgress ||
              roomName === '' ||
              password === '' ||
              (variant === 'Game Names' && showFilters && hasLessThan25Games) ||
              (variant === 'Custom' && custom === '') ||
              (isUsingCustomizedPasta && customizedPasta == null)
            }
            onClick={async () => {
              setIsCreationInProgress(true);

              try {
                const url = await tryCreate(
                  roomName,
                  password,
                  variant === 'Game Names',
                  isLockout,
                  getSerializedPasta(false)
                );
                setError(null);
                setUrl(url);
                setIsCreationInProgress(false);
                window.open(url, '_blank');
              } catch (err: any) {
                setIsCreationInProgress(false);
                setUrl('');
                setError(err);
              }
            }}
            color="green"
          >
            Create Bingosync Board
          </Button>
          <Button
            disabled={isUsingCustomizedPasta && customizedPasta == null}
            onClick={() => {
              navigator.clipboard.writeText(getSerializedPasta(true));
            }}
          >
            Copy Pasta to Clipboard
          </Button>
          {url !== '' && (
            <Alert variant="light" color="green" title="Success!" icon={<IconCheck />}>
              Your bingo board is available at{' '}
              <a href={url} target="_blank">
                {url}
              </a>
            </Alert>
          )}
          {error != null && (
            <Alert
              variant="light"
              color="red"
              title="Failed to create bingo board"
              icon={<IconExclamationMark />}
            >
              {error.message}
            </Alert>
          )}
        </Stack>
      </Card>
    </Container>
  );
}

async function tryCreate(
  roomName: string,
  password: string,
  isGameNames: boolean,
  isLockout: boolean,
  pasta: string
): Promise<string> {
  const response = await fetch('https://bingosync-proxy-52352836062.us-west1.run.app/create', {
    method: 'POST',
    body: new URLSearchParams({
      room_name: roomName,
      passphrase: password,
      nickname: 'ufo50bingobot',
      game_type: '18',
      variant_type: isGameNames ? '172' : '187',
      custom_json: pasta,
      lockout_mode: isLockout ? '2' : '1',
      seed: '',
    }).toString(),
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
  });

  const json = await response.json();
  const url = json.url;
  if (url === 'https://www.bingosync.com/') {
    throw new Error('Malformed bingosync request');
  }
  return url;
}
