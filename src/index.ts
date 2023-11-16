function pad_(num) {
  return `${num < 10 ? "0" : ""}${num}`;
}
global.pad_ = pad_;

function ICS_TEXT(text) {
  text = text.toString();
  return text.replace(/([;,\\])/g, "\\$1").replace(/\n/g, "\\n");
}
global.ICS_TEXT = ICS_TEXT;

function ICS_DATE(year, month = 1, day = 1) {
  // TODO validate params

  if (typeof year === "string") {
    return year;
  }

  if (Array.isArray(year)) {
    return ICS_DATE(...(year as [number, number, number]));
  }

  return `${year}${pad_(month)}${pad_(day)}`;
}
global.ICS_DATE = ICS_DATE;

function ICS_TIME(hour, minute = 0, second = 0, utcOrTzid = undefined) {
  // TODO validate params
  if (typeof hour === "string") {
    return hour;
  }

  if (Array.isArray(hour)) {
    return ICS_TIME(...(hour as [number, number, number, (string | boolean)?]));
  }

  return `${
    utcOrTzid && utcOrTzid !== "Z" && utcOrTzid !== true
      ? `TZID=${utcOrTzid}:`
      : ""
  }${pad_(hour)}${pad_(minute)}${pad_(second)}${
    utcOrTzid && (utcOrTzid === "Z" || utcOrTzid === true) ? "Z" : ""
  }`;
}
global.ICS_TIME = ICS_TIME;

function ICS_DATE_TIME(
  year,
  month = 1,
  day = 1,
  hour = 0,
  minute = 0,
  second = 0,
  utcOrTzid = undefined
) {
  if (typeof year === "string") {
    return year;
  }

  if (Array.isArray(year)) {
    return ICS_DATE_TIME(
      ...(year as [
        number,
        number,
        number,
        number,
        number,
        number,
        (string | boolean)?
      ])
    );
  }

  return `${
    utcOrTzid && utcOrTzid !== "Z" && utcOrTzid !== true
      ? `TZID=${utcOrTzid}:`
      : ""
  }${ICS_DATE(year, month, day)}T${ICS_TIME(
    hour,
    minute,
    second,
    utcOrTzid && (utcOrTzid === "Z" || utcOrTzid === true) ? true : undefined
  )}`;
}
global.ICS_DATE_TIME = ICS_DATE_TIME;

function VEVENT(
  dtstamp,
  uid,
  dtstart,
  className = undefined,
  created = undefined,
  description = undefined,
  geo = undefined,
  lastMod = undefined,
  location = undefined,
  organizer = undefined,
  priority = undefined,
  seq = undefined,
  status = undefined,
  summary = undefined,
  transp = undefined,
  url = undefined,
  recurid = undefined,
  rrule = undefined,
  dtend = undefined,
  duration = undefined,
  attach = [],
  attendee = [],
  categories = [],
  comment = [],
  contact = [],
  exdate = [],
  rstatus = [],
  related = [],
  resources = [],
  rdate = [],
  xProp = [],
  ianaProp = []
) {
  if (dtend && duration) {
    throw new Error("Only one of DTEND and DURATION may be specified");
  }
  // TODO validate params
  if (Array.isArray(dtstamp)) {
    dtstamp = ICS_DATE_TIME(
      ...(dtstamp as [
        number,
        number,
        number,
        number,
        number,
        number,
        (string | boolean)?
      ])
    );
  }
  if (Array.isArray(dtstart)) {
    dtstart = ICS_DATE_TIME(
      ...(dtstart as [
        [number, number, number, number, number, number, (string | boolean)?]
      ])
    );
  }
  const props = [];

  const addProp = (name, value, transform = (t) => t) => {
    if (value !== undefined) {
      if (value.toString().length > 0) {
        // TODO is this safe to exclude empty strings?
        value = transform(value);
        var separator = ":";
        switch (transform) {
          case ICS_DATE_TIME:
            // TODO does this logic adhere to RFC 5545?
            if (/^[^0-9]/.test(value)) {
              separator = ";";
            }
            break;
        }
        props.push(`${name}${separator}${value}`);
      }
    }
  };

  const addProps = (name, value, transform = (t) => t) => {
    if (Array.isArray(value)) {
      value.forEach((v) => addProp(name, v, transform));
    } else {
      addProp(name, value, transform);
    }
  };

  addProp("UID", uid, ICS_TEXT);
  addProp("DTSTAMP", dtstamp, ICS_DATE_TIME);
  addProp("DTSTART", dtstart, ICS_DATE_TIME);
  addProp("CLASS", className);
  addProp("CREATED", created);
  addProp("DESCRIPTION", description, ICS_TEXT);
  addProp("GEO", geo);
  addProp("LAST-MOD", lastMod, ICS_DATE_TIME);
  addProp("LOCATION", location);
  addProp("ORGANIZER", organizer);
  addProp("PRIORITY", priority);
  addProp("SEQ", seq);
  addProp("STATUS", status);
  addProp("SUMMARY", summary, ICS_TEXT);
  addProp("TRANSP", transp);
  addProp("URL", url);
  addProp("RECURID", recurid);
  addProp("RRULE", rrule);
  addProp("DTEND", dtend, ICS_DATE_TIME);
  addProp("DURATION", duration);
  addProps("ATTACH", attach);
  addProps("ATTENDEE", attendee);
  addProps("CATEGORIES", categories);
  addProps("COMMENT", comment, ICS_TEXT);
  addProps("CONTACT", contact);
  addProps("EXDATE", exdate);
  addProps("RSTATUS", rstatus);
  addProps("RELATED", related);
  addProps("RESOURCES", resources);
  addProps("RDATE", rdate);
  addProps("X-PROP", xProp);
  addProps("IANA-PROP", ianaProp);

  return ["BEGIN:VEVENT", ...props, "END:VEVENT"].join("\n");
}
global.VEVENT = VEVENT;

function VCALENDAR(name, body = [], prodid = "Generated by Google Sheets") {
  return [
    "BEGIN:VCALENDAR",
    `PRODID:${ICS_TEXT(prodid)}`,
    "VERSION:2.0",
    `X-WR-CALNAME:${ICS_TEXT(name)}`,
    `X-WR-TIMEZONE:America/New_York
BEGIN:VTIMEZONE
TZID:America/New_York
X-LIC-LOCATION:America/New_York
BEGIN:DAYLIGHT
TZOFFSETFROM:-0500
TZOFFSETTO:-0400
TZNAME:EDT
DTSTART:19700308T020000
RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU
END:DAYLIGHT
BEGIN:STANDARD
TZOFFSETFROM:-0400
TZOFFSETTO:-0500
TZNAME:EST
DTSTART:19701101T020000
RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU
END:STANDARD
END:VTIMEZONE`,
    ...body.filter((elt) => elt.toString().length > 0),
    "END:VCALENDAR",
  ];
}
global.VCALENDAR = VCALENDAR;

function ICS_WEBCAL_FEED(id, a1Range, filename = undefined) {
  id = id.replace(/\./g, "_");
  const identifier = `${SpreadsheetApp.getActive().getId()}.${id}`;
  PropertiesService.getScriptProperties().setProperty(
    `feed.${identifier}`,
    a1Range
  );
  filename = filename || `${id}.ics`;
  return `${process.env.SCRIPT_URL}?feed=${identifier}&filename=${filename}`;
}
global.ICS_WEBCAL_FEED = ICS_WEBCAL_FEED;

function fold_(content) {
  const CRLF = "\r\n";
  return content
    .split("\n")
    .map((line) => {
      var folded = "";
      do {
        folded =
          folded +
          (folded.length > 0 ? CRLF + "\t" : "") +
          line.substring(0, 75);
        line = line.substring(75);
      } while (line.length > 0);
      return folded;
    })
    .join(CRLF);
}
global.fold_ = fold_;

function doGet(e) {
  const match = e.parameter.feed.match(/(.+)\.(.+)/);
  const sheet = SpreadsheetApp.openById(match[1]);
  const a1Range = PropertiesService.getScriptProperties().getProperty(
    `feed.${e.parameter.feed}`
  );
  const filename = e.parameter.filename || `${match[2]}.ics`;
  const content = sheet
    .getRange(a1Range)
    .getValues()
    .filter((val) => val.toString().length > 0)
    .join("\n");
  return ContentService.createTextOutput(fold_(content))
    .setMimeType(ContentService.MimeType.ICAL)
    .downloadAsFile(filename);
}
global.doGet = doGet;
